import { connect } from "@/lib/db";
import ClinicalNote from "@/models/ClinicalNote";
import { NextRequest, NextResponse } from "next/server";
import { requireDoctorSession } from "@/lib/auth/require-session";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  const patientId = req.nextUrl.searchParams.get("patientId");
  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
  }

  await connect();
  const notes = await ClinicalNote.find({ patientId }).sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  if (!body.patientId || !body.body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connect();
  const note = await ClinicalNote.create({
    patientId: body.patientId,
    authorId: session.sub,
    body: body.body,
  });

  await logAuditEvent({
    actorId: session.sub,
    action: "clinical_note.create",
    resource: String(note._id),
    metadata: { patientId: body.patientId },
  });

  return NextResponse.json(note, { status: 201 });
}
