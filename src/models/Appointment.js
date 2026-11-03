import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    doctorProfileId: { type: String, required: true },
    doctorUserId: String,
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    type: {
      type: String,
      enum: ["video", "chat", "in_person"],
      default: "video",
    },
    notes: String,
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
