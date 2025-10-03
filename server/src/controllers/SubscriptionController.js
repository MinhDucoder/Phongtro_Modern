import Subscription from "../models/subscriptionSchema.js";
import PackagePlan from "../models/packagePlanSchema.js";
import Payment from "../models/paymentSchema.js";
import User from "../models/userSchema.js";
import { vnpay } from "../config/vnpay.config.js";
import { success, error } from "../utils/responeHandler.js";

class SubscriptionController {
  // Lấy danh sách gói đăng tin
  async getPackagePlans(req, res, next) {
    try {
      const packages = await PackagePlan.find({ isActive: true })
        .sort({ sortOrder: 1 });

      return success(res, packages);
    } catch (err) {
      return error(res, err.message || "Lỗi server", 500);
    }
  }

  // Lấy subscription hiện tại của user
  async getCurrentSubscription(req, res, next) {
    try {
      const userId = req.user.id;

      // Tìm subscription đang active
      const subscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      }).populate("payment");

      if (!subscription) {
        // Tạo subscription free mặc định
        const freePackage = await PackagePlan.findOne({ type: "free" });
        if (freePackage) {
          const newSubscription = await Subscription.create({
            user: userId,
            packageType: freePackage.type,
            packageName: freePackage.name,
            price: freePackage.price,
            duration: freePackage.duration,
            postLimit: freePackage.postLimit,
            priority: freePackage.priority,
            features: freePackage.features,
            startDate: new Date(),
            endDate: new Date(Date.now() + freePackage.duration * 24 * 60 * 60 * 1000),
            status: "active",
          });

          // Cập nhật user
          await User.findByIdAndUpdate(userId, {
            currentSubscription: newSubscription._id,
          });

          return success(res, {
            subscription: newSubscription,
            message: "Đã tạo gói miễn phí mặc định",
          });
        }
      }

      return success(res, {
        subscription,
        message: "Lấy thông tin gói đăng tin thành công",
      });
    } catch (err) {
      return error(res, err.message || "Lỗi server", 500);
    }
  }

  // Tạo đơn hàng thanh toán cho gói đăng tin
  async createSubscriptionPayment(req, res, next) {
    try {
      console.log('Auth user from req.user:', req.user);
      
      if (!req.user || !req.user.id) {
        console.log('No user in request - authentication failed');
        return error(res, "Vui lòng đăng nhập để thanh toán", 401);
      }
      
      const userId = req.user.id;
      const { packageId, paymentMethod } = req.body;

      console.log('Payment request:', { userId, packageId, paymentMethod });

      // Tìm thông tin gói
      const packagePlan = await PackagePlan.findById(packageId);

      console.log('Found package:', packagePlan);

      if (!packagePlan || !packagePlan.isActive) {
        console.log('Package not found or inactive');
        return error(res, "Gói đăng tin không tồn tại", 404);
      }

      if (packagePlan.type === "free") {
        return error(res, "Gói miễn phí không cần thanh toán", 400);
      }

      // Kiểm tra subscription hiện tại
      const currentSubscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      });

      console.log('Current subscription:', currentSubscription);

      if (currentSubscription && currentSubscription.packageType === packagePlan.type) {
        return error(res, "Bạn đã đăng ký gói này rồi", 400);
      }

      console.log('Creating payment record...');
      
      // Generate unique transaction ID
      const transactionId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentData = {
        user: userId,
        packageName: packagePlan.name,
        packageType: packagePlan.type,
        amount: packagePlan.price,
        currency: "VND",
        status: "pending",
        paymentMethod: "vnpay",
        transactionId: transactionId,
        packageStartDate: new Date(),
        packageEndDate: new Date(Date.now() + packagePlan.duration * 24 * 60 * 60 * 1000),
        packageDuration: packagePlan.duration,
        metadata: {
          packagePlan: packagePlan._id,
          packageName: packagePlan.name,
          duration: packagePlan.duration,
          postLimit: packagePlan.postLimit,
        },
      };
      
      console.log('Payment data to create:', paymentData);

      let payment;
      try {
        // Tạo payment record
        payment = await Payment.create(paymentData);
        console.log('Payment created successfully:', payment);
      } catch (paymentError) {
        console.error('Error creating payment:', paymentError);
        console.error('Payment error details:', paymentError.message);
        console.error('Payment error stack:', paymentError.stack);
        throw paymentError;
      }

      console.log('Creating VNPay URL...');

      let paymentUrl;
      try {
        // Tạo URL thanh toán VNPay
        paymentUrl = vnpay.buildPaymentUrl({
          vnp_Amount: packagePlan.price,
          vnp_TxnRef: payment._id.toString(),
          vnp_OrderInfo: `Thanh toan goi dang tin ${packagePlan.name}`,
          vnp_OrderType: "other",
          vnp_ReturnUrl: process.env.VNP_RETURNURL,
          vnp_IpAddr: req.ip || "127.0.0.1",
        });
        console.log('VNPay URL created successfully:', paymentUrl);
      } catch (vnpayError) {
        console.error('Error creating VNPay URL:', vnpayError);
        console.error('VNPay error details:', vnpayError.message);
        console.error('VNPay error stack:', vnpayError.stack);
        throw vnpayError;
      }

      return success(res, {
        paymentUrl,
        paymentId: payment._id,
        packageInfo: packagePlan,
        message: "Tạo đơn hàng thành công",
      });
    } catch (err) {
      console.error('=== ERROR IN CREATE SUBSCRIPTION PAYMENT ===');
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Full error object:', err);
      return error(res, err.message || "Lỗi server", 500);
    }
  }

  // Xử lý callback từ VNPay
  async handlePaymentCallback(req, res, next) {
    try {
      const vnpayData = req.query;
      
      // Verify signature
      const isValid = vnpay.verifyReturnUrl(vnpayData);
      
      if (!isValid) {
        return error(res, "Chữ ký không hợp lệ", 400);
      }

      const paymentId = vnpayData.vnp_TxnRef;
      const responseCode = vnpayData.vnp_ResponseCode;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return error(res, "Đơn hàng không tồn tại", 404);
      }

      if (responseCode === "00") {
        // Thanh toán thành công
        await Payment.findByIdAndUpdate(paymentId, {
          status: "completed",
          transactionId: vnpayData.vnp_TransactionNo,
          paidAt: new Date(),
        });

        // Tạo subscription mới
        console.log('Payment metadata:', payment.metadata);
        console.log('Looking for package ID:', payment.metadata?.packagePlan);
        
        const packagePlan = await PackagePlan.findById(payment.metadata.packagePlan);
        
        console.log('Found package plan:', packagePlan);
        
        if (!packagePlan) {
          console.error('Package plan not found with ID:', payment.metadata?.packagePlan);
          return error(res, "Không tìm thấy thông tin gói đăng tin", 404);
        }
        
        // Hủy subscription cũ (nếu có)
        await Subscription.updateMany(
          { user: payment.user, status: "active" },
          { status: "cancelled" }
        );

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + packagePlan.duration * 24 * 60 * 60 * 1000);

        const subscription = await Subscription.create({
          user: payment.user,
          packageType: packagePlan.type,
          packageName: packagePlan.name,
          price: packagePlan.price,
          duration: packagePlan.duration,
          postLimit: packagePlan.postLimit,
          priority: packagePlan.priority,
          features: packagePlan.features,
          startDate,
          endDate,
          status: "active",
          payment: payment._id,
        });

        // Cập nhật user
        await User.findByIdAndUpdate(payment.user, {
          currentSubscription: subscription._id,
          $push: { subscriptionHistory: subscription._id },
        });

        // Redirect về trang dashboard tin đăng với thông báo thành công
        const callbackUrl = new URL(`${process.env.FRONTEND_URL}/dashboard/tin-dang`);
        callbackUrl.searchParams.set('payment', 'success');
        callbackUrl.searchParams.set('package', packagePlan.name);
        callbackUrl.searchParams.set('vnp_ResponseCode', responseCode);
        callbackUrl.searchParams.set('vnp_TransactionNo', vnpayData.vnp_TransactionNo);
        
        return res.redirect(callbackUrl.toString());
      } else {
        // Thanh toán thất bại
        await Payment.findByIdAndUpdate(paymentId, {
          status: "failed",
          failureReason: vnpayData.vnp_ResponseCode,
        });

        const callbackUrl = new URL(`${process.env.FRONTEND_URL}/thanh-toan`);
        callbackUrl.searchParams.set('payment', 'failed');
        callbackUrl.searchParams.set('vnp_ResponseCode', responseCode);
        
        return res.redirect(callbackUrl.toString());
      }
    } catch (err) {
      console.error("Payment callback error:", err);
      const callbackUrl = new URL(`${process.env.FRONTEND_URL}/thanh-toan-goi`);
      callbackUrl.searchParams.set('vnp_ResponseCode', '99'); // Error
      callbackUrl.searchParams.set('vnp_TransactionStatus', '02'); // Error
      
      return res.redirect(callbackUrl.toString());
    }
  }

  // Lấy lịch sử subscription
  async getSubscriptionHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const subscriptions = await Subscription.find({ user: userId })
        .populate("payment")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Subscription.countDocuments({ user: userId });

      return success(res, {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        message: "Lấy lịch sử gói đăng tin thành công",
      });
    } catch (err) {
      return error(res, err.message || "Lỗi server", 500);
    }
  }

  // Kiểm tra có thể đăng tin không
  async checkPostPermission(req, res, next) {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      });

      if (!subscription) {
        return error(res, "Bạn chưa có gói đăng tin", 403);
      }

      const canPost = subscription.usedPosts < subscription.postLimit;
      const remainingPosts = subscription.postLimit - subscription.usedPosts;

      return success(res, {
        canPost,
        remainingPosts,
        subscription: {
          packageType: subscription.packageType,
          packageName: subscription.packageName,
          postLimit: subscription.postLimit,
          usedPosts: subscription.usedPosts,
          endDate: subscription.endDate,
          priority: subscription.priority,
        },
        message: "Kiểm tra quyền đăng tin thành công",
      });
    } catch (err) {
      return error(res, err.message || "Lỗi server", 500);
    }
  }

  // Sử dụng 1 lượt đăng tin
  async usePostSlot(userId) {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      });

      if (!subscription) {
        throw new Error("Không có gói đăng tin active");
      }

      if (subscription.usedPosts >= subscription.postLimit) {
        throw new Error("Đã hết lượt đăng tin");
      }

      await Subscription.findByIdAndUpdate(subscription._id, {
        $inc: { usedPosts: 1 },
      });

      return true;
    } catch (err) {
      throw err;
    }
  }

  // Hoàn trả 1 lượt đăng tin (khi xóa tin)
  async refundPostSlot(userId) {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      });

      if (subscription && subscription.usedPosts > 0) {
        await Subscription.findByIdAndUpdate(subscription._id, {
          $inc: { usedPosts: -1 },
        });
      }

      return true;
    } catch (err) {
      console.error("Refund post slot error:", err);
      return false;
    }
  }
}

export default new SubscriptionController();