import { connect } from "@/lib/db";
import AuditEvent from "@/models/AuditEvent";

type AuditInput = {
  actorId: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditInput) {
  try {
    await connect();
    await AuditEvent.create({
      ...input,
      metadata: input.metadata || {},
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
