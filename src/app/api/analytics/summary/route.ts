import { connect } from "@/lib/db";
import Chat from "@/models/Chat";
import Report from "@/models/Reports";
import Appointment from "@/models/Appointment";
import { NextResponse } from "next/server";
import {
  getActingDoctorId,
  getChatIdentityIds,
  requireDoctorSession,
} from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireDoctorSession();
  if (session instanceof NextResponse) return session;

  await connect();
  const acting = await getActingDoctorId();
  const identityIds = await getChatIdentityIds(session);
  const chats = await Chat.find({ participants: { $in: identityIds } });
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const appointmentsToday = acting
    ? await Appointment.countDocuments({
        doctorProfileId: acting,
        startsAt: { $gte: todayStart, $lte: todayEnd },
        status: "scheduled",
      })
    : 0;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const reportsThisWeek = await Report.countDocuments({
    createdAt: { $gte: weekAgo },
  });

  return NextResponse.json({
    openChats: chats.length,
    appointmentsToday,
    reportsThisWeek,
  });
}
