import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { clearActingDoctorCookie } from "@/lib/auth/acting-doctor-cookie";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  clearActingDoctorCookie(response);
  return response;
}
