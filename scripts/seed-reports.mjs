/**
 * Seeds dummy lab test reports for each non-admin patient user.
 * Usage: node scripts/seed-reports.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";

const ADMIN_EMAIL = "doctor@gmail.com";

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

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error("Missing MONGODB_URL in .env.local or .env");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  firstName: String,
  lastName: String,
});

const ReportSchema = new mongoose.Schema(
  {
    patientName: String,
    patientId: String,
    testName: String,
    testResult: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Report =
  mongoose.models.Report || mongoose.model("Report", ReportSchema);

const LAB_REPORTS = [
  {
    testName: "Complete Blood Count (CBC)",
    testResult:
      "WBC 6.2 K/uL, RBC 4.8 M/uL, Hemoglobin 14.1 g/dL, Platelets 245 K/uL.\nAll values within reference range. No signs of anemia or active infection.",
  },
  {
    testName: "Lipid Panel",
    testResult:
      "Total cholesterol 185 mg/dL, LDL 110 mg/dL, HDL 52 mg/dL, Triglycerides 95 mg/dL.\nBorderline LDL; lifestyle modification recommended. Recheck in 6 months.",
  },
  {
    testName: "HbA1c",
    testResult:
      "HbA1c 5.4% (36 mmol/mol).\nConsistent with normal glycemic control over the past 3 months.",
  },
  {
    testName: "Thyroid Panel (TSH)",
    testResult:
      "TSH 2.1 mIU/L (reference 0.4–4.0).\nEuthyroid; no medication adjustment indicated.",
  },
  {
    testName: "Comprehensive Metabolic Panel",
    testResult:
      "Glucose (fasting) 92 mg/dL, BUN 14 mg/dL, Creatinine 0.9 mg/dL, eGFR >90.\nElectrolytes within normal limits. No acute metabolic concerns.",
  },
  {
    testName: "Urinalysis",
    testResult:
      "Appearance: clear. Specific gravity 1.015. Protein: negative. Glucose: negative. Nitrites: negative.\nNo evidence of UTI or renal spillage.",
  },
];

function displayName(user) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  if (user.username) return user.username;
  return user.email?.split("@")[0] || "Patient";
}

async function main() {
  await mongoose.connect(MONGODB_URL, {
    dbName: "hospital",
    connectTimeoutMS: 30000,
  });

  const patients = await User.find({
    email: { $ne: ADMIN_EMAIL },
  }).lean();

  if (patients.length === 0) {
    console.log("No patient users found. Register a patient account first.");
    await mongoose.disconnect();
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const user of patients) {
    const patientId = String(user._id);
    const patientName = displayName(user);

    for (const lab of LAB_REPORTS) {
      const exists = await Report.findOne({
        patientId,
        testName: lab.testName,
      });
      if (exists) {
        skipped += 1;
        continue;
      }
      await Report.create({
        patientName,
        patientId,
        testName: lab.testName,
        testResult: lab.testResult,
      });
      inserted += 1;
    }
  }

  console.log(
    `Done. Patients: ${patients.length}, inserted: ${inserted}, skipped (already exist): ${skipped}.`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
