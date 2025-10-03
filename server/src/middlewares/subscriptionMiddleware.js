import SubscriptionController from "../controllers/SubscriptionController.js";
import Subscription from "../models/subscriptionSchema.js";
import { error } from "../utils/responeHandler.js";

// Middleware kiểm tra quyền đăng tin
export const checkPostPermission = async (req, res, next) => {
  try {
    console.log('=== CHECK POST PERMISSION ===');
    console.log('User ID:', req.user?.id);
    
    const userId = req.user.id;
    
    // Kiểm tra subscription hiện tại trực tiếp từ database
    const subscription = await Subscription.findOne({
      user: userId,
      status: "active",
      endDate: { $gt: new Date() }
    });

    console.log('Found subscription:', subscription);

    if (!subscription) {
      console.log('No active subscription found');
      return error(res, "Bạn chưa có gói đăng tin. Vui lòng chọn gói để tiếp tục.", 403);
    }
    
    // Kiểm tra còn lượt đăng không
    if (subscription.usedPosts >= subscription.postLimit) {
      console.log('Post limit exceeded:', subscription.usedPosts, '>=', subscription.postLimit);
      return error(res, `Bạn đã hết lượt đăng tin. Gói ${subscription.packageName} chỉ cho phép ${subscription.postLimit} tin đăng`, 403);
    }

    // Kiểm tra gói còn hạn không
    if (new Date(subscription.endDate) <= new Date()) {
      console.log('Subscription expired');
      return error(res, "Gói đăng tin đã hết hạn", 403);
    }

    console.log('Permission check passed');
    // Lưu thông tin subscription vào request để sử dụng sau
    req.subscription = subscription;
    next();
  } catch (err) {
    console.error('=== CHECK POST PERMISSION ERROR ===');
    console.error('Error:', err);
    return error(res, err.message || "Lỗi kiểm tra quyền đăng tin", 500);
  }
};

// Middleware sử dụng lượt đăng tin sau khi tạo post thành công
export const usePostSlot = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await SubscriptionController.usePostSlot(userId);
    next();
  } catch (err) {
    console.error("Error using post slot:", err);
    // Không block response, chỉ log error
    next();
  }
};

// Middleware hoàn trả lượt đăng tin khi xóa post
export const refundPostSlot = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await SubscriptionController.refundPostSlot(userId);
    next();
  } catch (err) {
    console.error("Error refunding post slot:", err);
    // Không block response, chỉ log error
    next();
  }
};