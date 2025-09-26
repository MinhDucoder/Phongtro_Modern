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
      // Mật khẩu không bắt buộc nếu user đăng nhập bằng OAuth (có google_id hoặc facebook_id)
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
    last_login: { type: Date, default: null },
    is_deleted: { type: Boolean, default: false }, // Cờ xóa mềm
    deleted_at: { type: Date, default: null }, // Thời gian xóa mềm
    verification_token: { type: String }, // Mã xác thực email
    verification_token_expires: { type: Date }, // Thời hạn của mã xác thực
    password_reset_token: { type: String }, // Mã đặt lại mật khẩu
    password_reset_expires: { type: Date }, // Thời hạn mã đặt lại mật khẩu
    refresh_token: { type: String }, // Mã làm mới phiên đăng nhập
    google_id: { type: String },
    facebook_id: { type: String }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("User", userSchema);
