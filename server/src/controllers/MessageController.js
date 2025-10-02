// controllers/messageController.js
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

class MessageController {
  // Lấy danh sách message trong conversation
  async list(req, res, next) {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Message.find({ conversationId })
          .populate("sender", "full_name avatar role")
          .populate("receiver", "full_name avatar role")
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit),
        Message.countDocuments({ conversationId })
      ]);

      res.json({ success: true, items, total });
    } catch (error) {
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

      res.status(201).json({ success: true, message });
    } catch (error) {
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
