import Notification from "../models/notification.js";
import catchAsync from "../middlewares/catchAsync.js";

class NotificationController {
  // Get all notifications for current user
  getNotifications = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.filter; // 'all', 'unread', 'important'

    let query = { userId };

    // Apply filters
    if (filter === "unread") {
      query.isRead = false;
    } else if (filter === "important") {
      query.priority = "high";
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  });

  // Mark notification as read
  markAsRead = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  });

  // Mark all notifications as read
  markAllAsRead = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  });

  // Delete notification
  deleteNotification = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  });

  // Delete all notifications
  deleteAllNotifications = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const result = await Notification.deleteMany({ userId });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  });

  // Get unread count
  getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      success: true,
      count,
    });
  });
}

export default new NotificationController();



