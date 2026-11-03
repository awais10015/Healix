import { connect } from "@/lib/db";
import Appointment from "@/models/Appointment";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { isDoctorSession } from "@/lib/auth/roles";
import { getActingDoctorId } from "@/lib/auth/require-session";
import { logAuditEvent } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  await connect();
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isDoctor = isDoctorSession(session);
  const acting = isDoctor ? await getActingDoctorId() : null;
  const canEdit =
    appointment.patientId === session.sub ||
    (isDoctor && acting && appointment.doctorProfileId === acting);

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  if (body.status) appointment.status = body.status;
  if (body.startsAt) appointment.startsAt = new Date(body.startsAt);
  if (body.endsAt) appointment.endsAt = new Date(body.endsAt);
  await appointment.save();

  await logAuditEvent({
    actorId: session.sub,
    action: "appointment.update",
    resource: id,
    metadata: { status: appointment.status },
  });

  return NextResponse.json(appointment);
}
