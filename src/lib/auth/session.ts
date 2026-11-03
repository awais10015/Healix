import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  type SessionPayload,
  type SafeUser,
} from "./constants";
import { signSession, verifySession } from "./jwt";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(
  payload: SessionPayload
): Promise<string> {
  return signSession(payload);
}

export function applySessionCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}

export function sessionToSafeUser(
  session: SessionPayload,
  mongoUser?: {
    username?: string;
    photo?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }
): SafeUser {
  return {
    id: session.sub,
    email: session.email,
    username: mongoUser?.username,
    firstName: mongoUser?.firstName ?? session.firstName,
    lastName: mongoUser?.lastName ?? session.lastName,
    photo: mongoUser?.photo,
    role: mongoUser?.role ?? session.role,
  };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
