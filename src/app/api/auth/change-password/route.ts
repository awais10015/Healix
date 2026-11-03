import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/lib/modals/user.modal";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { isValidPassword } from "@/lib/auth/session";
import { requireSession } from "@/lib/auth/require-session";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword || !isValidPassword(newPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  await connect();
  const user = await User.findById(session.sub);
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password incorrect" }, { status: 401 });
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  return NextResponse.json({ ok: true });
}
