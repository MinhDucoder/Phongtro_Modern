import Notification from "~/models/notification";

class NotificationService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> Set of socketIds
  }

  //gan userId voi socketid khi user connect
  resgisterUserSocket(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId).push(socketId);
  }

  //bo mapping khi user disconnect
  unregisterUserSocket(userId, socketId) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets
        .get(userId)
        .filter((id) => id !== socketId);
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, sockets);
      }
    }
  }

  //tao thong bao vaf emit realtime
  async createNotification({ userId, type, content, link = "" }) {
    const notification = await Notification.create({
      userId,
      type,
      content,
      link,
    });

    //emit qua socket neu user dang online
    if (this.userSockets.has(userId.toString())) {
      this.userSockets.get(userId.toString()).forEach((socketId) => {
        this.io.to(socketId).emit("notification", notification);
      });
    }
    return notification;
  }

  //lay thong bao cua user
  async getUserNotifications(userId, limit = 20, skip = 0) {
    return await Notification.find(userId)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  //danh dau thong bao da doc
  async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }
}
