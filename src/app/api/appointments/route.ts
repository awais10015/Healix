import { connect } from "@/lib/db";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";
import {
  getActingDoctorId,
  requireSession,
} from "@/lib/auth/require-session";
import { isDoctorSession } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();

  if (isDoctorSession(session)) {
    const acting = await getActingDoctorId();
    if (!acting) {
      return NextResponse.json([]);
    }
    const list = await Appointment.find({
      doctorProfileId: acting,
    }).sort({ startsAt: 1 });
    return NextResponse.json(list);
  }

  const list = await Appointment.find({ patientId: session.sub }).sort({
    startsAt: 1,
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const body = await req.json();
  const {
    patientId,
    doctorProfileId,
    startsAt,
    endsAt,
    type,
    notes,
  } = body;

  if (isDoctorSession(session)) {
    const acting = await getActingDoctorId();
    if (!acting) {
      return NextResponse.json(
        { error: "Select a doctor profile first" },
        { status: 400 }
      );
    }
    if (!patientId) {
      return NextResponse.json({ error: "patientId required" }, { status: 400 });
    }
    const doc = {
      patientId,
      doctorProfileId: acting,
      startsAt: new Date(startsAt),
      endsAt: endsAt
        ? new Date(endsAt)
        : new Date(new Date(startsAt).getTime() + 30 * 60000),
      type: type || "video",
      notes: notes || "",
      createdBy: session.sub,
      doctorUserId: session.sub,
    };
    const appointment = await Appointment.create(doc);
    await Notification.create({
      userId: doc.patientId,
      title: "New appointment",
      body: `Scheduled for ${doc.startsAt.toLocaleString()}`,
      link: "/appointments",
    });
    await logAuditEvent({
      actorId: session.sub,
      action: "appointment.create",
      resource: String(appointment._id),
    });
    return NextResponse.json(appointment, { status: 201 });
  }

  if (!doctorProfileId) {
    return NextResponse.json(
      { error: "doctorProfileId required" },
      { status: 400 }
    );
  }

  const doc = {
    patientId: session.sub,
    doctorProfileId: String(doctorProfileId),
    startsAt: new Date(startsAt),
    endsAt: endsAt
      ? new Date(endsAt)
      : new Date(new Date(startsAt).getTime() + 30 * 60000),
    type: type || "video",
    notes: notes || "",
    createdBy: session.sub,
    doctorUserId: undefined as string | undefined,
  };

  const appointment = await Appointment.create(doc);

  await Notification.create({
    userId: session.sub,
    title: "Appointment confirmed",
    body: `Scheduled for ${doc.startsAt.toLocaleString()}`,
    link: "/appointments",
  });

  await logAuditEvent({
    actorId: session.sub,
    action: "appointment.create",
    resource: String(appointment._id),
  });

  return NextResponse.json(appointment, { status: 201 });
}
