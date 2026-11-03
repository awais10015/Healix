import { connect } from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import User from "@/lib/modals/user.modal";
import Report from "@/models/Reports";
import { NextRequest, NextResponse } from "next/server";
import { requireDoctorSession } from "@/lib/auth/require-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  await connect();

  const user = await User.findOne({ _id: id, role: "patient" }).lean();
  if (!user) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const row = user as Record<string, unknown> & { _id: unknown };
  const { passwordHash: _pw, ...safeUser } = row;

  const profile = await PatientProfile.findOne({ userId: id });
  const reports = await Report.find({ patientId: id }).sort({ createdAt: -1 });

  return NextResponse.json({
    user: { ...safeUser, id: String(row._id) },
    profile,
    reports,
  });
}
