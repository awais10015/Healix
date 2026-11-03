import { NextResponse } from "next/server";
import {
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { ACTING_DOCTOR_COOKIE_NAME } from "@/lib/acting-doctor-storage";

const actingDoctorCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export function applyActingDoctorCookie(
  response: NextResponse,
  doctorProfileId: string
): NextResponse {
  response.cookies.set(ACTING_DOCTOR_COOKIE_NAME, doctorProfileId, actingDoctorCookieOptions);
  return response;
}

export function clearActingDoctorCookie(response: NextResponse): NextResponse {
  response.cookies.set(ACTING_DOCTOR_COOKIE_NAME, "", {
    ...actingDoctorCookieOptions,
    maxAge: 0,
  });
  return response;
}
