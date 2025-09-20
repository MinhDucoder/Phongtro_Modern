// src/models/mediaSchema.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // link Cloudinary
    public_id: { type: String, required: true }, // id cloudinary để xoá khi cần
    folder: { type: String, default: "assets" }, // folder Cloudinary
    ownerType: {
      type: String,
      enum: ["Room", "Post", "User"],
      required: false,
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, refPath: "ownerType" },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
