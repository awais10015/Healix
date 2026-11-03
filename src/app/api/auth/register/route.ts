import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/lib/modals/user.modal";
import { createUser } from "@/lib/actions/user.action";
import { serializeUser } from "@/lib/user-serialize";
import {
  hashPassword,
  applySessionCookie,
  setSessionCookie,
  isValidEmail,
  isValidPassword,
} from "@/lib/auth";
import { isEmailDuplicateKeyError } from "@/lib/reconcile-user-indexes";

async function buildSessionResponse(user: Record<string, unknown>) {
  const id = String(user._id);
  const token = await setSessionCookie({
    sub: id,
    email: user.email as string,
    role: (user.role as string) || "patient",
    firstName: user.firstName as string | undefined,
    lastName: user.lastName as string | undefined,
  });
  const safe = serializeUser(user);
  const response = NextResponse.json({ user: safe });
  return applySessionCookie(response, token);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, username, role: roleRaw } =
      body;

    const role =
      roleRaw === "doctor" || roleRaw === "patient" ? roleRaw : "patient";

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
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connect();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const created = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || "",
      lastName: lastName || "",
      username: username || email.split("@")[0],
      role,
    });

    if (!created) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    return buildSessionResponse(created);
  } catch (err) {
    console.error("Register error:", err);
    if (isEmailDuplicateKeyError(err)) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
