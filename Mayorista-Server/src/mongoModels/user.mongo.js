// mongoModels/user.mongo.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
