import { NextResponse } from "next/server";
import Meeting from "@/models/meetingModel";
import { connect } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import {
  assertCanAccessChatParticipants,
  requireSession,
} from "@/lib/auth/require-session";

export async function POST(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const body = await req.json();
  const { meetingId, participants, createdBy, description, startsAt } = body;

  if (!meetingId || !Array.isArray(participants) || participants.length < 2) {
    return NextResponse.json(
      { error: "Invalid meeting payload" },
      { status: 400 }
    );
  }

  const participantStrings = participants.map(String);
  const access = await assertCanAccessChatParticipants(
    session,
    participantStrings
  );
  if (access !== true) return access;

  await pusherServer.trigger("chat-app", "meeting-created", {
    message: "Doctor started a meeting with you",
  });

  try {
    const meeting = await Meeting.create({
      meetingId,
      participants: participantStrings,
      createdBy: createdBy || session.sub,
      description,
      startsAt,
    });
    return NextResponse.json(meeting, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
