// socket/chatHandler.js
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import findOrCreateConversation from "../utils/conversation.js";
import { sendNotification } from "../utils/notificationHelper.js";
import User from "../models/userSchema.js";

export default function chatHandler(io, socket) {
  // Track online users
  const onlineUsers = new Map(); // userId -> socketId

  // 👉 User goes online
  socket.on("userOnline", (callback) => {
    const userId = socket.user.id.toString();
    onlineUsers.set(userId, socket.id);
    
    // Broadcast to all clients that this user is online
    socket.broadcast.emit("userOnline", { userId, isOnline: true });
    
    if (callback) callback({ success: true });
  });

  // 👉 User goes offline
  socket.on("userOffline", (callback) => {
    const userId = socket.user.id.toString();
    onlineUsers.delete(userId);
    
    // Broadcast to all clients that this user is offline
    socket.broadcast.emit("userOnline", { userId, isOnline: false });
    
    if (callback) callback({ success: true });
  });

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

  // 👉 Leave conversation room
  socket.on("leaveConversation", ({ conversationId }, callback) => {
    try {
      if (!conversationId) throw new Error("conversationId is required");

      socket.leave(conversationId.toString());
      console.log(`🚪 ${socket.id} left conversation ${conversationId}`);

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
            text: message.text || '',
            sender: message.sender,
            createdAt: message.createdAt || new Date(),
          },
          updatedAt: new Date(),
          $inc: { [`unread.${receiver}`]: 1 },
        });

        // 3. Emit cho room
        io.to(convId.toString()).emit("receiveMessage", message);

        // 3.5. Invalidate message cache for this conversation
        try {
          const redis = await import('redis');
          const client = redis.createClient();
          await client.connect();
          
          const keys = await client.keys(`messages:${convId}:*`);
          if (keys.length > 0) {
            await client.del(keys);
            console.log('🗑️ Socket: Invalidated message cache for conversation:', convId);
          }
          
          await client.disconnect();
        } catch (cacheError) {
          console.error('⚠️ Failed to invalidate cache:', cacheError.message);
        }

        // 4. Tạo thông báo cho người nhận (nếu không phải là tin nhắn tự gửi)
        if (sender !== receiver) {
          try {
            // Lấy thông tin người gửi để tạo thông báo
            const senderUser = await User.findById(sender).select('full_name avatar');
            
            if (senderUser) {
              await sendNotification({
                userId: receiver,
                type: "message",
                title: "Tin nhắn mới",
                content: `${senderUser.full_name}: ${text || '[Hình ảnh]'}`,
                link: `/chat?conversationId=${convId}`,
                priority: "high",
                relatedUser: {
                  id: sender,
                  name: senderUser.full_name,
                  avatar: senderUser.avatar?.url || senderUser.avatar
                },
                metadata: {
                  conversationId: convId.toString(),
                  messageId: message._id.toString(),
                  senderId: sender
                }
              });
              
              console.log(`📢 Message notification sent to user ${receiver} from ${senderUser.full_name}`);
            }
          } catch (notificationError) {
            console.error("❌ Error creating message notification:", notificationError);
            // Không throw error để không ảnh hưởng đến việc gửi tin nhắn
          }
        }

        // 5. Callback ack
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

  // 👉 Typing start
  socket.on("typingStart", ({ conversationId, receiver, userName }, callback) => {
    try {
      const userId = socket.user.id.toString();
      
      // Broadcast typing to conversation participants
      socket.to(conversationId.toString()).emit("typingStart", {
        userId,
        userName,
        conversationId
      });
      
      if (callback) callback({ success: true });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // 👉 Typing stop
  socket.on("typingStop", ({ conversationId, receiver }, callback) => {
    try {
      const userId = socket.user.id.toString();
      
      // Broadcast typing stop to conversation participants
      socket.to(conversationId.toString()).emit("typingStop", {
        userId,
        conversationId
      });
      
      if (callback) callback({ success: true });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

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

  // 👉 Handle disconnect - mark user offline
  socket.on("disconnect", () => {
    const userId = socket.user.id.toString();
    onlineUsers.delete(userId);
    
    // Broadcast to all clients that this user is offline
    socket.broadcast.emit("userOnline", { userId, isOnline: false });
    
    console.log(`👋 User ${userId} disconnected`);
  });
}
