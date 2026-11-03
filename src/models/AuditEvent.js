import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actorId: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.AuditEvent ||
  mongoose.model("AuditEvent", auditSchema);
