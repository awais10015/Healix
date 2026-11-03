import { connect } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const list = await Notification.find({ userId: session.sub })
    .sort({ createdAt: -1 })
    .limit(50);
  return NextResponse.json(list);
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  await connect();
  if (body.markAllRead) {
    await Notification.updateMany(
      { userId: session.sub },
      { $set: { read: true } }
    );
    return NextResponse.json({ ok: true });
  }
  if (body.id) {
    await Notification.updateOne(
      { _id: body.id, userId: session.sub },
      { $set: { read: true } }
    );
  }
  return NextResponse.json({ ok: true });
}
