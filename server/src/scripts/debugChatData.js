import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import User from '../models/userSchema.js';

dotenv.config();

async function debugConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all conversations
    const conversations = await Conversation.find({}).populate('participants', 'full_name role avatar').lean();
    console.log('\n📋 All conversations:');
    conversations.forEach((conv, i) => {
      console.log(`${i+1}. ID: ${conv._id}`);
      console.log(`   Participants: ${conv.participants?.map(p => `${p.full_name} (${p.role})`).join(', ')}`);
      console.log(`   Last message: ${conv.lastMessage?.text || 'None'}`);
      console.log(`   Unread: ${JSON.stringify(conv.unread)}`);
      console.log(`   Updated: ${conv.updatedAt}`);
      console.log('');
    });
    
    // Get all messages
    const messages = await Message.find({}).populate('sender', 'full_name').populate('receiver', 'full_name').lean();
    console.log('\n💬 All messages:');
    messages.forEach((msg, i) => {
      console.log(`${i+1}. ID: ${msg._id}`);
      console.log(`   Conversation: ${msg.conversationId}`);
      console.log(`   From: ${msg.sender?.full_name || msg.sender}`);
      console.log(`   To: ${msg.receiver?.full_name || msg.receiver}`);
      console.log(`   Text: ${msg.text}`);
      console.log(`   Status: ${msg.status}`);
      console.log(`   Created: ${msg.createdAt}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugConversations();
