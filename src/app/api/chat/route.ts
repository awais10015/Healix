import { connect } from "@/lib/db";
import Chat from "@/models/Chat";
import "@/models/Message";
import { NextRequest, NextResponse } from "next/server";
import {
  assertCanAccessChatParticipants,
  chatIncludesParticipant,
  getChatIdentityIds,
  requireSession,
  unauthorizedResponse,
} from "@/lib/auth/require-session";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const body = await req.json();
  const { participants } = body;

  if (!participants || participants.length !== 2) {
    return NextResponse.json(
      { error: "Participants must be an array of two user IDs." },
      { status: 400 }
    );
  }

  const participantStrings = participants.map(String);
  const access = await assertCanAccessChatParticipants(
    session,
    participantStrings
  );
  if (access !== true) return access;

  const existingChat = await Chat.findOne({
    participants: { $all: participantStrings, $size: 2 },
  }).populate("messages");

  if (existingChat) {
    return NextResponse.json(existingChat);
  }

  const newChat = await Chat.create({ participants: participantStrings });
  const populatedChat = await Chat.findById(newChat._id).populate("messages");
  return NextResponse.json(populatedChat);
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");

  if (user1 && user2) {
    const pair = [user1, user2];
    const access = await assertCanAccessChatParticipants(session, pair);
    if (access !== true) return access;

    const chat = await Chat.findOne({
      participants: { $all: pair, $size: 2 },
    }).populate("messages");

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json(chat);
  }

  const identityIds = await getChatIdentityIds(session);
  if (identityIds.length === 0) {
    return NextResponse.json([]);
  }

  const chats = await Chat.find({
    participants: { $in: identityIds },
  })
    .sort({ updatedAt: -1 })
    .populate("messages");

  const filtered = chats.filter((c) =>
    chatIncludesParticipant(c.participants.map(String), identityIds)
  );

  return NextResponse.json(filtered);
}
