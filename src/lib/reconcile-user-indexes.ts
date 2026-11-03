import type { Mongoose } from "mongoose";

/** Unique indexes that must remain on `users`. */
const PROTECTED_UNIQUE_INDEX_NAMES = new Set(["_id_", "email_1"]);

/**
 * Removes legacy Clerk-era unique indexes (photo, clerkId, etc.) that block
 * multiple JWT users when optional fields are null/missing.
 */
export async function reconcileUserIndexes(mongooseInstance: Mongoose) {
  try {
    const collection = mongooseInstance.connection.db?.collection("users");
    if (!collection) return;

    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (!idx.unique || !idx.name) continue;
      if (PROTECTED_UNIQUE_INDEX_NAMES.has(idx.name)) continue;

      await collection.dropIndex(idx.name);
      console.info(`[db] Dropped stale unique index users.${idx.name}`);
    }
  } catch (err) {
    console.warn("[db] Could not reconcile user indexes:", err);
  }
}

export function isMongoDuplicateKeyError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    (err as { code?: number }).code === 11000
  );
}

export function isEmailDuplicateKeyError(err: unknown): boolean {
  if (!isMongoDuplicateKeyError(err)) return false;
  const message = (err as { message?: string }).message ?? "";
  const keyPattern = (err as { keyPattern?: Record<string, unknown> })
    .keyPattern;
  if (keyPattern && "email" in keyPattern) return true;
  return message.includes("email_1");
}
