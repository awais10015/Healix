import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patientName: String,
    patientId: String,
    testName: String,
    testResult: String,
    status: {
      type: String,
      enum: ["pending", "final"],
      default: "final",
    },
    submittedBy: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
