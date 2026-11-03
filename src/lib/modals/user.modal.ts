import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  photo: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    enum: ["doctor", "patient", "nurse", "admin"],
    default: "patient",
  },
});

const User = models?.User || model("User", UserSchema);
export default User;
