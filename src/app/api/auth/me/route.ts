import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/lib/modals/user.modal";
import { getSession, sessionToSafeUser } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    await connect();
    const doc = await User.findById(session.sub).lean();
    if (!doc || Array.isArray(doc)) {
      return NextResponse.json({ user: sessionToSafeUser(session) });
    }
    const u = doc as {
      username?: string;
      photo?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    };
    return NextResponse.json({
      user: sessionToSafeUser(session, {
        username: u.username,
        photo: u.photo,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      }),
    });
  } catch {
    return NextResponse.json({
      user: sessionToSafeUser(session),
    });
  }
}
