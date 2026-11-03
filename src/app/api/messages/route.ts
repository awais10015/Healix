import { connect } from "@/lib/db";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { NextResponse, type NextRequest } from "next/server";
import {
  assertCanAccessChatParticipants,
  getChatIdentityIds,
  requireSession,
  unauthorizedResponse,
} from "@/lib/auth/require-session";
import { isDoctorSession } from "@/lib/auth/roles";

async function allowedSenderIds(session: Awaited<ReturnType<typeof requireSession>>) {
  if (session instanceof NextResponse) return session;
  return getChatIdentityIds(session);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  try {
    await connect();
    const body = await req.json();
    const { senderId, receiverId, text, chatId } = body;

    if (!senderId || !receiverId || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const identityIds = await allowedSenderIds(session);
    if (identityIds instanceof NextResponse) return identityIds;
    if (!identityIds.includes(String(senderId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
      const access = await assertCanAccessChatParticipants(
        session,
        chat.participants.map(String)
      );
      if (access !== true) return access;
    } else {
      const pair = [String(senderId), String(receiverId)];
      const access = await assertCanAccessChatParticipants(session, pair);
      if (access !== true) return access;

      chat = await Chat.findOne({
        participants: { $all: pair, $size: 2 },
      });

      if (!chat) {
        chat = await Chat.create({ participants: pair });
      }
    }

    const message = await Message.create({
      senderId,
      receiverId,
      chatId: chat._id,
      text,
    });

    chat.messages = [...chat.messages, message._id];
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Message POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  if (!chatId) {
    return unauthorizedResponse("chatId required");
  }

  await connect();
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const access = await assertCanAccessChatParticipants(
    session,
    chat.participants.map(String)
  );
  if (access !== true) return access;

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
  return NextResponse.json(messages);
}
