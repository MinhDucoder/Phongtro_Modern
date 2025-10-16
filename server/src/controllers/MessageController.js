// controllers/messageController.js
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import { getOrSetCache, deleteCacheByPrefix } from "../services/redisService.js";

class MessageController {
  // Rate limiting map
  static requestCounts = new Map();
  
  // Lấy danh sách message trong conversation với caching
  async list(req, res, next) {
    try {
      // Rate limiting: max 10 requests per minute per user
      const userId = req.user?.id;
      if (userId) {
        const now = Date.now();
        const userRequests = MessageController.requestCounts.get(userId) || [];
        const recentRequests = userRequests.filter(time => now - time < 60000); // Last minute
        
        if (recentRequests.length >= 10) {
          return res.status(429).json({ 
            success: false, 
            message: 'Too many requests. Please wait a moment.' 
          });
        }
        
        recentRequests.push(now);
        MessageController.requestCounts.set(userId, recentRequests);
      }
      
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Cache key includes conversation ID, page, and limit
      const cacheKey = `messages:${conversationId}:page:${page}:limit:${limit}`;
      
      // Disable server-side caching for messages to ensure fresh data
      console.log('📨 Loading messages from DB for conversation:', conversationId);
      const [rawItems, total] = await Promise.all([
        Message.find({ conversationId })
          .populate("sender", "full_name avatar role")
          .populate("receiver", "full_name avatar role")
          .sort({ createdAt: -1 }) // newest first to get latest page window
          .skip(skip)
          .limit(limit)
          .lean(),
        Message.countDocuments({ conversationId })
      ]);

      // Return items in ascending order for chronological UI
      const items = rawItems.reverse();
      const result = { items, total };

      // Disable browser caching for message lists to avoid stale data after refresh
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
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

      // Invalidate message cache for this conversation (NodeCache helper)
      deleteCacheByPrefix(`messages:${conversationId}:`);
      console.log('🗑️ Invalidated message cache for conversation:', conversationId);

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
