import express from "express";
import NotificationController from "../../controllers/NotificationController.js";
import { authenticate } from "../../middlewares/checkToken.js";

const notificationRoute = express.Router();

// All routes require authentication
notificationRoute.use(authenticate());

// Get all notifications for current user
notificationRoute.get("/", NotificationController.getNotifications);

// Get unread count
notificationRoute.get("/unread-count", NotificationController.getUnreadCount);

// Mark notification as read
notificationRoute.put("/:notificationId/read", NotificationController.markAsRead);

// Mark all as read
notificationRoute.put("/mark-all-read", NotificationController.markAllAsRead);

// Delete notification
notificationRoute.delete("/:notificationId", NotificationController.deleteNotification);

// Delete all notifications
notificationRoute.delete("/", NotificationController.deleteAllNotifications);

export default notificationRoute;