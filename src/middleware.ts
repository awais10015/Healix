import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  SESSION_COOKIE_NAME,
  PROTECTED_PATH_PREFIXES,
  type SessionPayload,
} from "@/lib/auth/constants";
import { isDoctorSession } from "@/lib/auth/roles";
import { ACTING_DOCTOR_COOKIE_NAME } from "@/lib/acting-doctor-storage";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function getSessionFromToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as string) || "patient",
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await getSessionFromToken(token) : null;
  const isLoggedIn = Boolean(session);
  const actingDoctor = request.cookies.get(ACTING_DOCTOR_COOKIE_NAME)?.value;

  if (pathname === "/" && isLoggedIn) {
    if (isDoctorSession(session) && !actingDoctor) {
      return NextResponse.redirect(new URL("/select-doctor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isLoggedIn && (pathname === "/sign-in" || pathname === "/sign-up")) {
    if (isDoctorSession(session) && !actingDoctor) {
      return NextResponse.redirect(new URL("/select-doctor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    isLoggedIn &&
    isDoctorSession(session) &&
    !actingDoctor &&
    pathname !== "/select-doctor" &&
    isProtectedPath(pathname)
  ) {
    return NextResponse.redirect(new URL("/select-doctor", request.url));
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (isLoggedIn) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("redirect_url", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
