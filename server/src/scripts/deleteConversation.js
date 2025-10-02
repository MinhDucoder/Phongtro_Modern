import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';

dotenv.config();

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Missing MONGODB_URI in environment');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

async function deleteConversationById(conversationId) {
  if (!conversationId || !conversationId.trim()) {
    console.error('❌ Please provide a conversationId');
    process.exit(1);
  }

  try {
    const conv = await Conversation.findById(conversationId).lean();
    if (!conv) {
      console.log('ℹ️ Conversation not found:', conversationId);
      return;
    }

    console.log('🗑️ Deleting messages for conversation:', conversationId);
    const msgResult = await Message.deleteMany({ conversationId });
    console.log(`✅ Deleted ${msgResult.deletedCount} messages`);

    console.log('🗑️ Deleting conversation:', conversationId);
    await Conversation.deleteOne({ _id: conversationId });
    console.log('✅ Conversation deleted');
  } catch (err) {
    console.error('❌ Error deleting conversation:', err);
  }
}

(async () => {
  const conversationId = process.argv[2];
  await connectDB();
  await deleteConversationById(conversationId);
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
})();


