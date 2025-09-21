// models/message.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, trim: true },
    attachments: [
      {
        url: String,
        public_id: String, // nếu dùng cloudinary
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("Message", messageSchema);
