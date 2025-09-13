import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    balance: { type: Number, default: 0 },
    is_verified: { type: Boolean, default: false },
    is_banned: { type: Boolean, default: false },
    last_login: { type: Date, default: null },
    verification_token: { type: String }, // token xác thực email
    refresh_token: { type: String }, // refresh token
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("User", userSchema);
