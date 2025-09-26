// models/conversation.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    unread: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("Conversation", conversationSchema);
