import { NextResponse } from "next/server";
import type { SessionPayload } from "./constants";
import { getSession } from "./session";
import { isDoctorSession } from "./roles";
import { ACTING_DOCTOR_COOKIE_NAME } from "@/lib/acting-doctor-storage";
import { cookies } from "next/headers";

export async function getActingDoctorId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTING_DOCTOR_COOKIE_NAME)?.value ?? null;
}

/** User ids this session may appear as in chat (patient user id or acting doctor profile id). */
export async function getChatIdentityIds(
  session: SessionPayload
): Promise<string[]> {
  if (!isDoctorSession(session)) {
    return [session.sub];
  }
  const acting = await getActingDoctorId();
  return acting ? [acting] : [];
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireSession(): Promise<
  SessionPayload | NextResponse
> {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  return session;
}

export async function requireDoctorSession(): Promise<
  SessionPayload | NextResponse
> {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (!isDoctorSession(session)) return forbiddenResponse();
  return session;
}

export function chatIncludesParticipant(
  participants: string[],
  identityIds: string[]
): boolean {
  return identityIds.some((id) => participants.includes(String(id)));
}

export async function assertCanAccessChatParticipants(
  session: SessionPayload,
  participants: string[]
): Promise<true | NextResponse> {
  const identityIds = await getChatIdentityIds(session);
  if (identityIds.length === 0) {
    return forbiddenResponse("Select a doctor profile first");
  }
  if (!chatIncludesParticipant(participants, identityIds)) {
    return forbiddenResponse();
  }
  return true;
}
