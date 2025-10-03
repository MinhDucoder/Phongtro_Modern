import notificationHandler from "../sockets/notificationHandler.js";

let io = null;

// Initialize with io instance from server
export const initNotificationHelper = (ioInstance) => {
  io = ioInstance;
};

// Send notification to user
export const sendNotification = async ({
  userId,
  type,
  title,
  content,
  link = "",
  priority = "medium",
  relatedProperty,
  relatedUser,
  metadata,
}) => {
  if (!io) {
    console.warn("Socket.io not initialized in notification helper");
    return null;
  }

  try {
    const notification = await notificationHandler.createAndEmit(io, {
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

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Helper functions for common notification types

export const sendPostApprovedNotification = async (userId, postTitle, postId) => {
  return sendNotification({
    userId,
    type: "post_approved",
    title: "Bài đăng đã được duyệt",
    content: `Bài đăng "${postTitle}" đã được duyệt và hiển thị công khai.`,
    link: `/phong-tro/${postId}`,
    priority: "medium",
  });
};

export const sendPostRejectedNotification = async (userId, postTitle, reason, postId) => {
  return sendNotification({
    userId,
    type: "post_rejected",
    title: "Bài đăng bị từ chối",
    content: `Bài đăng "${postTitle}" đã bị từ chối. Lý do: ${reason}`,
    link: `/dashboard/tin-dang`,
    priority: "high",
  });
};

export const sendPaymentSuccessNotification = async (userId, packageName, amount) => {
  return sendNotification({
    userId,
    type: "payment",
    title: "Thanh toán thành công",
    content: `Bạn đã thanh toán ${amount.toLocaleString('vi-VN')}đ cho gói ${packageName}`,
    link: "/dashboard/thanh-toan",
    priority: "medium",
  });
};

export const sendMessageNotification = async (userId, senderName, message, conversationId) => {
  return sendNotification({
    userId,
    type: "message",
    title: `Tin nhắn mới từ ${senderName}`,
    content: message,
    link: `/chat/${conversationId}`,
    priority: "high",
  });
};

export const sendBookingNotification = async (userId, propertyTitle, bookingDate, propertyId) => {
  return sendNotification({
    userId,
    type: "booking",
    title: "Lịch hẹn mới",
    content: `Bạn có lịch hẹn xem phòng "${propertyTitle}" vào ${bookingDate}`,
    link: `/lich-hen`,
    priority: "high",
  });
};

export const sendSystemNotification = async (userId, title, content, link = "", priority = "medium") => {
  return sendNotification({
    userId,
    type: "system",
    title,
    content,
    link,
    priority,
  });
};



