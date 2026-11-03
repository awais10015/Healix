import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/lib/modals/user.modal";
import { requireSession } from "@/lib/auth/require-session";

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  await connect();
  const user = await User.findByIdAndUpdate(
    session.sub,
    {
      $set: {
        firstName: body.firstName,
        lastName: body.lastName,
        photo: body.photo,
        username: body.username,
      },
    },
    { new: true }
  ).lean();

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = user as Record<string, unknown> & { _id: unknown };
  const { passwordHash: _unused, ...safe } = row;
  return NextResponse.json({ ...safe, id: String(row._id) });
}
