// src/routes/v1/vipPostPayment.js
import express from "express";
import VIPPostPaymentController from "../../controllers/VIPPostPaymentController.js";
import { authenticate } from "../../middlewares/checkToken.js";
import catchAsync from "../../middlewares/catchAsync.js";

const router = express.Router();

// Lấy danh sách gói VIP
router.get("/packages", catchAsync(VIPPostPaymentController.getVIPPackages));

// Tạo URL thanh toán
router.post(
  "/create-payment",
  authenticate(),
  catchAsync(VIPPostPaymentController.createPaymentUrl)
);

// Callback từ VNPay
router.get(
  "/callback",
  catchAsync(VIPPostPaymentController.handlePaymentCallback)
);

// Kiểm tra trạng thái thanh toán
router.get(
  "/status/:paymentId",
  authenticate(),
  catchAsync(VIPPostPaymentController.checkPaymentStatus)
);

export default router;
