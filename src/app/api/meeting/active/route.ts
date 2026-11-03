import { NextResponse } from "next/server";
import Meeting from "@/models/meetingModel";
import { connect } from "@/lib/db";
import {
  getChatIdentityIds,
  requireSession,
  chatIncludesParticipant,
} from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const identityIds = await getChatIdentityIds(session);
  if (identityIds.length === 0) {
    return NextResponse.json([]);
  }

  const meetings = await Meeting.find().sort({ createdAt: -1 });
  const mine = meetings.filter((m) =>
    chatIncludesParticipant(
      (m.participants || []).map(String),
      identityIds
    )
  );

  return NextResponse.json(mine);
}
