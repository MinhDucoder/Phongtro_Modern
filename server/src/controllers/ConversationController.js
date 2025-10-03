// controllers/conversationController.js
import Conversation from "../models/conversation.js";

class ConversationController {
  // Tạo hoặc lấy conversation giữa 2 participants
  async create(req, res, next) {
    try {
      const { participants } = req.body; // array userId
      if (!participants || participants.length < 2) {
        return res.status(400).json({ success: false, message: "Participants required" });
      }

      // Tìm conversation có sẵn
      let conversation = await Conversation.findOne({
        participants: { $all: participants, $size: participants.length }
      });

      if (!conversation) {
        conversation = await Conversation.create({ participants });
      }

      res.status(201).json({ success: true, conversation });
    } catch (error) {
      next(error);
    }
  }

  // Danh sách conversation của user
  async list(req, res, next) {
    try {
      const userId = req.user.id; // lấy từ middleware auth
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [conversations, total] = await Promise.all([
        Conversation.find({ participants: userId })
          .populate("participants", "full_name avatar role")
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Conversation.countDocuments({ participants: userId })
      ]);

      // Manually populate lastMessage sender if exists
      const User = await import("../models/userSchema.js").then(m => m.default);
      const items = await Promise.all(
        conversations.map(async (conv) => {
          if (conv.lastMessage?.sender) {
            try {
              const sender = await User.findById(conv.lastMessage.sender)
                .select("full_name avatar role")
                .lean();
              if (sender) {
                conv.lastMessage.senderInfo = sender;
              }
            } catch (err) {
              console.error('Error populating lastMessage sender:', err);
            }
          }
          return conv;
        })
      );

      res.json({ success: true, items, total });
    } catch (error) {
      console.error('❌ ConversationController error:', error);
      next(error);
    }
  }

  // Lấy chi tiết một conversation theo ID (chỉ cho phép nếu user là participant)
  async show(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const conversation = await Conversation.findById(id)
        .populate('participants', 'full_name avatar role')
        .lean();

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant = (conversation.participants || []).some(
        (p) => String(p._id) === String(userId)
      );
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      return res.json({ success: true, data: conversation });
    } catch (error) {
      console.error('❌ ConversationController.show error:', error);
      next(error);
    }
  }
}

export default new ConversationController();
