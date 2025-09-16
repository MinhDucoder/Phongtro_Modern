import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    options: [
      {
        type: String,
        enum: ["aircon", "washing_machine", "balcony", "window", "fridge", "kitchen"],
      },
    ],
    favouriteLevel: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
