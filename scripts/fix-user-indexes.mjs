/**
 * Drops legacy Clerk unique indexes on users (photo, clerkId, etc.).
 * Keeps email_1. Usage: npm run fix:user-indexes
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";

const PROTECTED = new Set(["_id_", "email_1"]);

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const filePath = resolve(process.cwd(), name);
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFiles();

const url = process.env.MONGODB_URL;
if (!url) {
  console.error("MONGODB_URL is not set");
  process.exit(1);
}

await mongoose.connect(url, { dbName: "hospital" });
const collection = mongoose.connection.db.collection("users");
const indexes = await collection.indexes();

let dropped = 0;
for (const idx of indexes) {
  if (!idx.unique || !idx.name) continue;
  if (PROTECTED.has(idx.name)) continue;
  await collection.dropIndex(idx.name);
  console.log(`Dropped unique index users.${idx.name}`);
  dropped++;
}

if (dropped === 0) {
  console.log("No stale unique user indexes found.");
}

await mongoose.disconnect();
