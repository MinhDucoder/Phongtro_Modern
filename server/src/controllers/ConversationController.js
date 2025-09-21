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
      const userId = req.user._id; // lấy từ middleware auth
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Conversation.find({ participants: userId })
          .populate("participants", "full_name avatar role")
          .sort({ updated_at: -1 })
          .skip(skip)
          .limit(limit),
        Conversation.countDocuments({ participants: userId })
      ]);

      res.json({ success: true, items, total });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConversationController();
