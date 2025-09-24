// socket/chatHandler.js
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export default function chatHandler(io, socket) {
  // 👉 Join conversation room
  socket.on("joinConversation", ({ conversationId }, callback) => {
    try {
      socket.join(conversationId);
      console.log(`✅ ${socket.id} joined conversation ${conversationId}`);
      if (callback) callback({ success: true, conversationId });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // 👉 Send message
  socket.on("sendMessage", async ({ conversationId, receiver, text, attachments }, callback) => {
    try {
      const sender = socket.user._id;

      // 1. Tạo message
      const message = await Message.create({
        conversationId,
        sender,
        receiver,
        text,
        attachments,
      });

      // 2. Update lastMessage + updatedAt
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt,
        },
        updatedAt: new Date(),
      });

      // 3. Emit cho room
      io.to(conversationId).emit("receiveMessage", message);

      // 4. Callback về cho client (ack)
      if (callback) callback({ success: true, messageId: message._id });
    } catch (err) {
      console.error("❌ sendMessage error:", err.message);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // 👉 Message seen
  socket.on("messageSeen", async ({ messageId, conversationId }, callback) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { new: true }
      );

      if (!message) throw new Error("Message not found");

      io.to(conversationId).emit("messageSeen", {
        messageId: message._id,
        userId: socket.user._id,
        status: "seen",
      });

      if (callback) callback({ success: true, messageId });
    } catch (err) {
      console.error("❌ messageSeen error:", err.message);
      if (callback) callback({ success: false, error: err.message });
    }
  });
}

// xử lí callback lỗi client khi nhận respone từ server
// socket.emit("sendMessage", payload, (response) => {
//   if (response.success) {
//     console.log("✅ Message sent:", response.messageId);
//   } else {
//     console.error("❌ Error:", response.error);
//   }
// });
