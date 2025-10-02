// socket/chatHandler.js
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import findOrCreateConversation from "../utils/conversation.js";

export default function chatHandler(io, socket) {
  // 👉 Join conversation room
  socket.on("joinConversation", ({ conversationId }, callback) => {
    try {
      if (!conversationId) throw new Error("conversationId is required");

      socket.join(conversationId.toString());
      console.log(`✅ ${socket.id} joined conversation ${conversationId}`);

      if (callback) callback({ success: true, conversationId });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // 👉 Open conversation (find or create when user clicks "chat")
  socket.on("openConversation", async ({ otherUserId }, callback) => {
    try {
      const userId = socket.user.id.toString();
      if (!otherUserId) throw new Error("otherUserId is required");

      const conv = await findOrCreateConversation(userId, otherUserId);

      // join realtime room
      socket.join(conv._id.toString());

      // load last 50 messages
      let messages = await Message.find({ conversationId: conv._id })
        .sort({ createdAt: -1 }) // newest first
        .limit(50)
        .lean();

      messages.reverse(); // để hiển thị từ cũ -> mới

      if (callback)
        callback({ success: true, conversation: conv, messages });
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // 👉 Send message
  socket.on(
    "sendMessage",
    async ({ conversationId, receiver, text, attachments }, callback) => {
      try {
        const sender = socket.user.id.toString();

        if (!receiver) throw new Error("receiver is required");
        if (!text && (!attachments || attachments.length === 0)) {
          throw new Error("Message must have text or attachments");
        }

        let convId = conversationId;

        // fallback: auto create conversation if missing
        if (!convId) {
          const conv = await findOrCreateConversation(sender, receiver);
          convId = conv._id;
          socket.join(convId.toString());
        }

        // 1. Tạo message
        const message = await Message.create({
          conversationId: convId,
          sender,
          receiver,
          text,
          attachments,
        });

        // 2. Update lastMessage + updatedAt + unread count
        await Conversation.findByIdAndUpdate(convId, {
          lastMessage: {
            text: message.text,
            sender: message.sender,
            createdAt: message.createdAt,
          },
          updatedAt: new Date(),
          $inc: { [`unread.${receiver}`]: 1 },
        });

        // 3. Emit cho room
        io.to(convId.toString()).emit("receiveMessage", message);

        // 4. Callback ack
        if (callback)
          callback({
            success: true,
            messageId: message._id,
            conversationId: convId,
          });
      } catch (err) {
        console.error("❌ sendMessage error:", err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 👉 Message seen
  socket.on("messageSeen", async ({ messageId, conversationId }, callback) => {
    try {
      if (!messageId || !conversationId) {
        throw new Error("messageId and conversationId are required");
      }

      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { new: true }
      );

      if (!message) throw new Error("Message not found");

      // reset unread count cho user hiện tại
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: { [`unread.${socket.user.id}`]: 0 },
      });

      io.to(conversationId.toString()).emit("messageSeen", {
        messageId: message._id,
        userId: socket.user.id,
        status: "seen",
      });

      if (callback) callback({ success: true, messageId });
    } catch (err) {
      console.error("❌ messageSeen error:", err.message);
      if (callback) callback({ success: false, error: err.message });
    }
  });
}
