// src/controllers/VIPPostPaymentController.js
import { VNPay } from "vnpay";
import Payment from "../models/paymentSchema.js";
import Post from "../models/postSchema.js";
import { success, error } from "../utils/responeHandler.js";

// Khởi tạo VNPay instance
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASHSECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
});

// Giá gói VIP
const VIP_PACKAGES = {
  vip1: {
    name: "Tin VIP 1",
    price: 50000,
    duration: 30,
    priority: 1,
    features: ["Hiển thị nổi bật", "Ưu tiên cao", "Khung viền vàng"]
  },
  vip2: {
    name: "Tin VIP 2",
    price: 100000,
    duration: 30,
    priority: 2,
    features: ["Hiển thị rất nổi bật", "Ưu tiên rất cao", "Khung viền đỏ"]
  },
  vip3: {
    name: "Tin VIP 3",
    price: 200000,
    duration: 30,
    priority: 3,
    features: ["Hiển thị đặc biệt", "Ưu tiên tối đa", "Khung viền gradient"]
  }
};

class VIPPostPaymentController {
  /**
   * Tạo URL thanh toán VNPay cho tin VIP
   */
  async createPaymentUrl(req, res, next) {
    try {
      const { vipPackage, postData } = req.body;
      const userId = req.user.id;

      // Validate VIP package
      if (!VIP_PACKAGES[vipPackage]) {
        return error(res, "Gói VIP không hợp lệ", 400);
      }

      const packageInfo = VIP_PACKAGES[vipPackage];

      // Tạo payment record
      const payment = await Payment.create({
        user: userId,
        amount: packageInfo.price,
        paymentMethod: "vnpay",
        status: "pending",
        metadata: {
          type: "vip_post",
          vipPackage: vipPackage,
          postData: postData, // Lưu data tin đăng để tạo sau khi thanh toán
          packageInfo: packageInfo
        }
      });

      // Tạo URL thanh toán VNPay
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: process.env.VNP_TMNCODE,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: payment._id.toString(),
        vnp_OrderInfo: `Thanh toan tin VIP - ${packageInfo.name}`,
        vnp_OrderType: "other",
        vnp_Amount: packageInfo.price * 100, // VNPay yêu cầu nhân 100
        vnp_ReturnUrl: `${process.env.FRONTEND_URL.replace(':3000', ':5000')}/api/v1/vip-post-payment/callback`,
        vnp_IpAddr: req.ip || req.connection.remoteAddress,
        vnp_CreateDate: new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", ""),
      });

      return success(res, {
        paymentUrl,
        paymentId: payment._id,
        amount: packageInfo.price,
        package: packageInfo
      });
    } catch (err) {
      console.error("Error creating VIP post payment URL:", err);
      return error(res, err.message, 500);
    }
  }

  /**
   * Callback từ VNPay sau khi thanh toán
   */
  async handlePaymentCallback(req, res, next) {
    try {
      const vnpayData = req.query;
      
      // Verify chữ ký
      const isValid = vnpay.verifyReturnUrl(vnpayData);
      
      if (!isValid) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/dang-tin?payment=failed&reason=invalid_signature`
        );
      }

      const paymentId = vnpayData.vnp_TxnRef;
      const responseCode = vnpayData.vnp_ResponseCode;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/dang-tin?payment=failed&reason=payment_not_found`
        );
      }

      if (responseCode === "00") {
        // Thanh toán thành công
        await Payment.findByIdAndUpdate(paymentId, {
          status: "completed",
          transactionId: vnpayData.vnp_TransactionNo,
          paidAt: new Date(),
        });

        // Lấy thông tin post từ metadata
        const { postData, vipPackage, packageInfo } = payment.metadata;

        // Tạo tin đăng VIP
        const post = await Post.create({
          ...postData,
          landlord: payment.user,
          favouriteLevel: vipPackage,
          status: "pending", // Vẫn cần duyệt
          vipPackage: vipPackage,
          vipPayment: payment._id,
          vipExpiresAt: new Date(Date.now() + packageInfo.duration * 24 * 60 * 60 * 1000)
        });

        console.log("VIP post created:", post._id);

        // Redirect về trang thành công
        return res.redirect(
          `${process.env.FRONTEND_URL}/dang-tin?payment=success&postId=${post._id}&vipPackage=${vipPackage}`
        );
      } else {
        // Thanh toán thất bại
        await Payment.findByIdAndUpdate(paymentId, {
          status: "failed",
          failureReason: vnpayData.vnp_ResponseCode,
        });

        return res.redirect(
          `${process.env.FRONTEND_URL}/dang-tin?payment=failed&code=${responseCode}`
        );
      }
    } catch (err) {
      console.error("VIP payment callback error:", err);
      return res.redirect(
        `${process.env.FRONTEND_URL}/dang-tin?payment=error`
      );
    }
  }

  /**
   * Lấy danh sách gói VIP
   */
  async getVIPPackages(req, res, next) {
    try {
      return success(res, {
        packages: VIP_PACKAGES
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(req, res, next) {
    try {
      const { paymentId } = req.params;
      
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return error(res, "Không tìm thấy giao dịch", 404);
      }

      return success(res, {
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt,
        metadata: payment.metadata
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
}

export default new VIPPostPaymentController();
