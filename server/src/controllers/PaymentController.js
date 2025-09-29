import { vnpay } from "../config/vnpay.config.js";
import { ProductCode, VnpLocale } from "vnpay";
import dotenv from "dotenv";
dotenv.config();

class OrderController {
  // [POST] /api/payments
  async createOrder(req, res) {
    try {
      const orderId = Date.now().toString();
      const amount = req.body.amount || 10000;

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr:
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: process.env.VNP_RETURNURL,
        vnp_Locale: VnpLocale.VN,
      });

      return res.json({
        success: true,
        paymentUrl,
        orderId,
        amount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo đơn hàng",
        error: error.message,
      });
    }
  }

  // [GET] /payment_return
  async paymentReturn(req, res) {
    try {
      const verify = vnpay.verifyReturnUrl(req.query);
      console.log("DEBUG verify:", verify);
      console.log("DEBUG query:", req.query);
      if (!verify.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Invalid signature",
        });
      }

      if (verify.vnp_ResponseCode === "00") {
        return res.json({
          success: true,
          message: "Thanh toán thành công!",
          data: verify.vnp_Params,
        });
      } else {
        return res.json({
          success: false,
          message: "Thanh toán thất bại!",
          data: verify.vnp_Params,
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Lỗi xử lý returnUrl",
        error: err.message,
      });
    }
  }
}

export default new OrderController();
