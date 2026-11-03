import { connect } from "@/lib/db";
import User from "@/lib/modals/user.modal";
import { NextResponse } from "next/server";
import { serializeUser } from "@/lib/user-serialize";
import {
  requireDoctorSession,
  requireSession,
} from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (session.role === "doctor") {
    try {
      await connect();
      const users = await User.find({ role: "patient" })
        .sort({ username: 1 })
        .lean();
      const safe = users.map((u) =>
        serializeUser(u as Record<string, unknown>)
      );
      return NextResponse.json(safe);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
