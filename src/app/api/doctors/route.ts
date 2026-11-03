import { connect } from "@/lib/db";
import Doctor from "@/lib/modals/doctor.modal";
import { NextRequest, NextResponse } from "next/server";
import { requireDoctorSession, requireSession } from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  await connect();
  try {
    const doctors = await Doctor.find().sort({ id: 1 });
    return NextResponse.json(doctors);
  } catch (err) {
    console.error("Failed to fetch doctors:", err);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const body = await req.json();
  const max = await Doctor.findOne().sort({ id: -1 });
  const nextId = (max?.id || 0) + 1;
  const doc = await Doctor.create({
    id: body.id ?? nextId,
    name: body.name,
    designation: body.designation,
    image: body.image || "",
  });
  return NextResponse.json(doc, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const body = await req.json();
  if (body.id == null) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const doc = await Doctor.findOneAndUpdate(
    { id: body.id },
    {
      $set: {
        name: body.name,
        designation: body.designation,
        image: body.image,
      },
    },
    { new: true }
  );
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(doc);
}
