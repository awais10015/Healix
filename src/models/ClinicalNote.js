import mongoose from "mongoose";

const clinicalNoteSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    authorId: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ClinicalNote ||
  mongoose.model("ClinicalNote", clinicalNoteSchema);
