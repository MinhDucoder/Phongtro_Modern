import mongoose from "mongoose";

const roleRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role_requested: { type: String, enum: ["landlord"], required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
  reviewed_at: { type: Date },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin duyệt
});

export default mongoose.model("RoleRequest", roleRequestSchema);
