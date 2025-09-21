// socket/chatHandler.js
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export default function chatHandler(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // join conversation room
    socket.on("joinConversation", ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`✅ ${socket.id} joined conversation ${conversationId}`);
    });

    // send message
    socket.on("sendMessage", async ({ conversationId, receiver, text, attachments }) => {
      try {
        const sender = socket.user._id; // giả định bạn gán user vào socket khi auth
        // 1. create message
        const message = await Message.create({
          conversationId,
          sender,
          receiver,
          text,
          attachments,
        });

        // 2. update lastMessage in conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: message.text,
            sender: message.sender,
            createdAt: message.created_at,
          },
        });

        // 3. emit back to conversation room
        io.to(conversationId).emit("receiveMessage", message);

        // 4. ack cho sender
        socket.emit("messageSent", { messageId: message._id, status: "sent" });
      } catch (err) {
        console.error("Socket sendMessage error:", err.message);
        socket.emit("errorMessage", { message: err.message });
      }
    });

    // message seen
    socket.on("messageSeen", async ({ messageId, conversationId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { status: "seen" },
          { new: true }
        );

        // emit cho cả room biết message đã seen
        io.to(conversationId).emit("messageSeen", {
          messageId: message._id,
          status: "seen",
        });
      } catch (err) {
        console.error("Socket messageSeen error:", err.message);
        socket.emit("errorMessage", { message: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}
