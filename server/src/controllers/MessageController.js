// controllers/messageController.js
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import { getOrSetCache } from "../services/redisService.js";

class MessageController {
  // Lấy danh sách message trong conversation với caching
  async list(req, res, next) {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Cache key includes conversation ID, page, and limit
      const cacheKey = `messages:${conversationId}:page:${page}:limit:${limit}`;
      
      const result = await getOrSetCache(
        cacheKey,
        async () => {
          console.log('📨 Loading messages from DB for conversation:', conversationId);
          const [items, total] = await Promise.all([
            Message.find({ conversationId })
              .populate("sender", "full_name avatar role")
              .populate("receiver", "full_name avatar role")
              .sort({ createdAt: 1 })
              .skip(skip)
              .limit(limit)
              .lean(),
            Message.countDocuments({ conversationId })
          ]);
          return { items, total };
        },
        300 // Cache for 5 minutes
      );

      // Add cache headers
      res.set({
        'Cache-Control': 'private, max-age=300',
        'ETag': `"${conversationId}-${page}-${limit}"`
      });

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('❌ MessageController.list error:', error);
      next(error);
    }
  }

  // Gửi tin nhắn (backup cho socket)
  async create(req, res, next) {
    try {
      const { conversationId, receiver, text, attachments } = req.body;

      const message = await Message.create({
        conversationId,
        sender: req.user.id,
        receiver,
        text,
        attachments,
      });

      // update lastMessage in Conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: message.text,
          sender: message.sender,
          createdAt: message.created_at,
        },
      });

      // Invalidate message cache for this conversation
      const redis = await import('redis');
      const client = redis.createClient();
      await client.connect();
      
      // Delete all cached messages for this conversation
      const keys = await client.keys(`messages:${conversationId}:*`);
      if (keys.length > 0) {
        await client.del(keys);
        console.log('🗑️ Invalidated message cache for conversation:', conversationId);
      }
      
      await client.disconnect();

      res.status(201).json({ success: true, message });
    } catch (error) {
      console.error('❌ MessageController.create error:', error);
      next(error);
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markSeen(req, res, next) {
    try {
      const { messageId } = req.params;
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { new: true }
      );
      res.json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
