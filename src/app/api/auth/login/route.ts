import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/lib/modals/user.modal";
import { serializeUser } from "@/lib/user-serialize";
import {
  verifyPassword,
  applySessionCookie,
  setSessionCookie,
  isValidEmail,
  isValidPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await connect();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await setSessionCookie({
      sub: user._id.toString(),
      email: user.email,
      role: user.role || "patient",
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const safe = serializeUser(
      JSON.parse(JSON.stringify(user)) as Record<string, unknown>
    );
    const response = NextResponse.json({ user: safe });
    return applySessionCookie(response, token);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
