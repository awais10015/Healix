import { connect } from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import User from "@/lib/modals/user.modal";
import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctorSession,
  requireSession,
} from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (session.role !== "patient") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connect();
  let profile = await PatientProfile.findOne({ userId: session.sub });
  if (!profile) {
    profile = await PatientProfile.create({ userId: session.sub });
  }
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (session.role !== "patient") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connect();
  const body = await req.json();
  const profile = await PatientProfile.findOneAndUpdate(
    { userId: session.sub },
    {
      $set: {
        dateOfBirth: body.dateOfBirth,
        bloodType: body.bloodType,
        allergies: body.allergies,
        medications: body.medications,
        emergencyContact: body.emergencyContact,
      },
    },
    { upsert: true, new: true }
  );
  return NextResponse.json(profile);
}
