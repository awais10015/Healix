import { connect } from "@/lib/db";
import Report from "@/models/Reports";
import User from "@/lib/modals/user.modal";
import { getSession, isDoctorSession } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isDoctorSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connect();
  const body = await req.json();
  const { patientId, patientName, testName, testResult, status, notes } = body;

  if (!patientId || !testName || !testResult) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const patient = await User.findOne({ _id: patientId, role: "patient" });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const report = await Report.create({
    patientId,
    patientName: patientName || patient.firstName || patient.email,
    testName,
    testResult,
    status: status === "pending" ? "pending" : "final",
    submittedBy: session.sub,
    notes: notes || "",
  });

  await logAuditEvent({
    actorId: session.sub,
    action: "report.create",
    resource: String(report._id),
    metadata: { patientId },
  });

  return NextResponse.json(report);
}

export async function GET() {
  await connect();
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isDoctor = isDoctorSession(session);

  const reports = isDoctor
    ? await Report.find().sort({ createdAt: -1 })
    : await Report.find({ patientId: session.sub }).sort({ createdAt: -1 });

  return NextResponse.json(reports);
}
