import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: [arrayLimit, "Chat must have exactly 2 participants"],
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 2;
}

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
