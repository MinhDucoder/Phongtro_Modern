// socket/notificationHandler.js
import Notification from "../models/notification.js";

class NotificationSocketHandler {
  constructor() {
    this.userSockets = new Map(); // userId -> Set of socketIds
  }

  // Register user socket when connected
  registerUserSocket(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socketId);
    console.log(`📢 User ${userId} registered for notifications with socket ${socketId}`);
  }

  // Unregister user socket when disconnected
  unregisterUserSocket(userId, socketId) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      sockets.delete(socketId);
      
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
      console.log(`📢 User ${userId} unregistered from notifications`);
    }
  }

  // Create notification and emit to user
  async createAndEmit(io, { userId, type, title, content, link = "", priority = "medium", relatedProperty, relatedUser, metadata }) {
    try {
      // Create notification in database
      const notification = await Notification.create({
        userId,
        type,
        title,
        content,
        link,
        priority,
        relatedProperty,
        relatedUser,
        metadata,
      });

      // Emit to all user's connected sockets
      if (this.userSockets.has(userId.toString())) {
        const userSocketIds = this.userSockets.get(userId.toString());
        userSocketIds.forEach((socketId) => {
          io.to(socketId).emit("notification", notification);
        });
        console.log(`📢 Notification sent to user ${userId}:`, notification.title);
      }

      return notification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  // Socket event handlers
  setupHandlers(io, socket) {
    const userId = socket.user.id.toString();

    // Register user for notifications
    this.registerUserSocket(userId, socket.id);

    // Join user's personal notification room
    socket.join(`notification:${userId}`);

    // Handle disconnect
    socket.on("disconnect", () => {
      this.unregisterUserSocket(userId, socket.id);
    });

    // Optional: Client can request notification history
    socket.on("getNotifications", async ({ page = 1, limit = 20 }, callback) => {
      try {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
          Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Notification.countDocuments({ userId }),
        ]);

        if (callback) {
          callback({
            success: true,
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
        }
      } catch (error) {
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Mark notification as read via socket
    socket.on("markNotificationRead", async ({ notificationId }, callback) => {
      try {
        const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, userId },
          { isRead: true },
          { new: true }
        );

        if (callback) {
          callback({ success: true, notification });
        }
      } catch (error) {
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });
  }
}

// Export singleton instance
const notificationHandler = new NotificationSocketHandler();
export default notificationHandler;



