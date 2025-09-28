import mongoose from "mongoose";
import Conversation from "~/models/conversation.js";

export default async function findOrCreateConversation(userId, otherUserId) {
  // đảm bảo ObjectId hợp lệ
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
    throw new Error("Invalid userId or otherUserId (must be ObjectId)");
  }

  const participants = [userId.toString(), otherUserId.toString()].sort();

  try {
    const conv = await Conversation.findOneAndUpdate(
      { participants },
      {
        $setOnInsert: {
          participants,
          type: "private",
          unread: {
            [participants[0]]: 0,
            [participants[1]]: 0,
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return conv;
  } catch (error) {
    console.error("❌ findOrCreateConversation error:", error);
    throw error;
  }
}
