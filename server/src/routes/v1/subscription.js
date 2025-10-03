import express from "express";
import SubscriptionController from "../../controllers/SubscriptionController.js";
import { authenticateToken } from "../../middlewares/authenticate.js";

const router = express.Router();

// Lấy danh sách gói đăng tin
router.get("/packages", SubscriptionController.getPackagePlans);

// Lấy subscription hiện tại (cần auth)
router.get("/current", authenticateToken, SubscriptionController.getCurrentSubscription);

// Tạo đơn hàng thanh toán gói (cần auth)
router.post("/purchase", authenticateToken, SubscriptionController.createSubscriptionPayment);

// Lấy lịch sử subscription (cần auth)
router.get("/history", authenticateToken, SubscriptionController.getSubscriptionHistory);

// Kiểm tra quyền đăng tin (cần auth)
router.get("/check-permission", authenticateToken, SubscriptionController.checkPostPermission);

// VNPay callback (không cần auth)
router.get("/payment-callback", SubscriptionController.handlePaymentCallback);

export default router;