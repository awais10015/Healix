import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctorSession,
} from "@/lib/auth/require-session";
import { applyActingDoctorCookie } from "@/lib/auth/acting-doctor-cookie";
import { connect } from "@/lib/db";
import Doctor from "@/lib/modals/doctor.modal";

export async function POST(req: NextRequest) {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const doctorProfileId = body?.doctorProfileId;
  if (!doctorProfileId) {
    return NextResponse.json(
      { error: "doctorProfileId is required" },
      { status: 400 }
    );
  }

  await connect();
  const profile = await Doctor.findOne({
    $or: [{ id: Number(doctorProfileId) }, { id: doctorProfileId }],
  });
  if (!profile) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const response = NextResponse.json({
    ok: true,
    actingDoctorId: String(doctorProfileId),
  });
  return applyActingDoctorCookie(response, String(doctorProfileId));
}

export async function DELETE() {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;
  const { clearActingDoctorCookie } = await import(
    "@/lib/auth/acting-doctor-cookie"
  );
  const response = NextResponse.json({ ok: true });
  return clearActingDoctorCookie(response);
}
