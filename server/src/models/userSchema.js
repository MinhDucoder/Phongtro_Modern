import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true, trim: true },
    avatar: {
      url: String,
      public_id: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false, required: function() {
      // Password không required nếu user đăng nhập bằng OAuth (có google_id hoặc facebook_id)
      return !this.google_id && !this.facebook_id;
    }},
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["user", "landlord", "admin"],
      default: "user",
    },
    balance: { type: Number, default: 0 },
    is_verified: { type: Boolean, default: false },
    is_banned: { type: Boolean, default: false },
    last_login: { type: Date, default: null },
    verification_token: { type: String }, // token xác thực email
    verification_token_expires: { type: Date }, // thời hạn của token xác thực
    refresh_token: { type: String }, // refresh token
    google_id: { type: String },
    facebook_id: { type: String }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("User", userSchema);
