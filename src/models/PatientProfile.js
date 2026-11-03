import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    dateOfBirth: String,
    bloodType: String,
    allergies: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      phone: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PatientProfile ||
  mongoose.model("PatientProfile", patientProfileSchema);
