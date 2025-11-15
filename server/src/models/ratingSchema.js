import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true }, // thêm rating numeric
    comment: { type: String, default: "" },
  },
  { timestamps: true } // createdAt, updatedAt tự động
);

// Một user chỉ được đánh giá 1 lần trên 1 post
ratingSchema.index({ post: 1, user: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
