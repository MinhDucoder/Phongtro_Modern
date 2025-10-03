import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import Subscription from "../models/subscriptionSchema.js";
import PackagePlan from "../models/packagePlanSchema.js";
import dotenv from "dotenv";
import fs from "fs/promises";
import { generateVerificationToken, sendVerificationEmail, generatePasswordResetToken, sendPasswordResetEmail } from '../services/emailService.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'asdfsadfsadf';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'asdfkljhasdfsadf';

class AuthController {
  // REGISTER
  async register(req, res) {
    const { full_name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ 
      success: false,
      message: "Email này đã có tài khoản. Bạn có thể đăng nhập hoặc thử với email khác.",
      action: "login"  // Gợi ý frontend có thể hiển thị link đăng nhập
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      phone,
      is_verified: false,
      verification_token: verificationToken,
      verification_token_expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // thời gian 1 giờ
    });

    await newUser.save();

    // Tự động tạo gói đăng tin miễn phí cho user mới
    try {
      // Tìm gói miễn phí
      const freePackage = await PackagePlan.findOne({ type: "free", isActive: true });
      
      if (freePackage) {
        // Tạo subscription miễn phí
        const freeSubscription = await Subscription.create({
          user: newUser._id,
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
          usedPosts: 0 // Bắt đầu với 0 lượt đã sử dụng
        });

        // Cập nhật user với subscription
        await User.findByIdAndUpdate(newUser._id, {
          currentSubscription: freeSubscription._id,
        });

        console.log('Created free subscription for new user:', freeSubscription._id);
      } else {
        console.warn('Free package not found, user registered without subscription');
      }
    } catch (subscriptionError) {
      console.error('Error creating free subscription:', subscriptionError);
      // Không throw error để không ảnh hưởng đến việc đăng ký
    }

    console.log('Starting email verification process...');
    console.log('Environment variables:', {
      GMAIL_USER: process.env.GMAIL_USER,
      FRONTEND_URL: process.env.FRONTEND_URL,
      has_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD
    });

    // Gửi email xác thực
    const emailSent = await sendVerificationEmail(email, verificationToken);
    console.log('Email sending result:', emailSent);

    if (!emailSent) {
      console.error('Failed to send verification email');
      // Nếu không gửi được email, vẫn tạo tài khoản nhưng thông báo cho user
      res.status(201).json({ 
        message: "Đăng ký thành công! Có lỗi khi gửi email xác thực, vui lòng thử lại sau.",
        needVerification: true
      });
    } else {
      console.log('Verification email sent successfully');
      res.status(201).json({ 
        message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        needVerification: true
      });
    }
  }

  // Xác thực email
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      const user = await User.findOne({ 
        verification_token: token,
        verification_token_expires: { $gt: new Date() }
      });
      
      if (!user) {
        return res.status(400).json({ 
          success: false,
          message: "Token xác thực không hợp lệ hoặc đã hết hạn" 
        });
      }

      user.is_verified = true;
      user.verification_token = undefined;
      await user.save();

      res.status(200).json({ 
        success: true,
        message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ." 
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ 
        success: false,
        message: "Có lỗi xảy ra khi xác thực email" 
      });
    }
  }

  // Gửi lại email xác thực
  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Không tìm thấy tài khoản với email này" 
        });
      }

      if (user.is_verified) {
        return res.status(400).json({ 
          success: false,
          message: "Tài khoản này đã được xác thực" 
        });
      }

      const verificationToken = generateVerificationToken();
      user.verification_token = verificationToken;
      user.verification_token_expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // Token expires in 1 hour
      await user.save();

      const emailSent = await sendVerificationEmail(email, verificationToken);

      if (!emailSent) {
        return res.status(500).json({ 
          success: false,
          message: "Có lỗi khi gửi email xác thực, vui lòng thử lại sau" 
        });
      }

      res.status(200).json({ 
        success: true,
        message: "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn." 
      });
    } catch (error) {
      console.error('Resend verification email error:', error);
      res.status(500).json({ 
        success: false,
        message: "Có lỗi xảy ra khi gửi lại email xác thực" 
      });
    }
  }

  // LOGIN
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(401).json({ 
        success: false, 
        message: "Email hoặc mật khẩu không chính xác", 
        errorType: "invalid_credentials" 
      });

      if (!user.password) {
        console.error('No password found for user:', email);
        return res.status(500).json({ 
          success: false, 
          message: "Tài khoản của bạn có vấn đề. Vui lòng liên hệ hỗ trợ.", 
          errorType: "account_issue" 
        });
      }

      // Kiểm tra xác thực email
      if (!user.is_verified) {
        return res.status(403).json({ 
          success: false, 
          message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực trước khi đăng nhập.",
          needVerification: true,
          email: user.email
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ 
        success: false, 
        message: "Email hoặc mật khẩu không chính xác", 
        errorType: "invalid_credentials" 
      });

      const token = jwt.sign({ 
        id: user._id, 
        role: user.role,
        email: user.email,
        full_name: user.full_name
      }, JWT_SECRET, { expiresIn: "30d" }); // Extended to 30 days

      user.last_login = new Date();
      await user.save();

      const userWithoutPassword = {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at,
        last_login: user.last_login
      };

      // Set cookie with proper options for better persistence
      res.cookie("accessToken", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: 'lax',
        path: '/',
        maxAge: 30*24*60*60*1000, // 30 days instead of 7 days
        domain: process.env.NODE_ENV === "production" ? '.yourdomain.com' : undefined // Only set domain in production
      });

      res.status(200).json({ 
        success: true,
        message: "Đăng nhập thành công", 
        token, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau." });
    }
  }

  // ====== REFRESH TOKEN (chưa dùng) ======
  // async refreshToken(req, res) {
  //   const { refreshToken } = req.cookies;
  //   if (!refreshToken) return res.status(401).json({ message: "Vui lòng đăng nhập lại" });

  //   try {
  //     const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  //     const user = await User.findById(payload.id);
  //     if (!user || user.refresh_token !== refreshToken) throw new Error();

  //     const newToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
  //     res.json({ token: newToken });
  //   } catch {
  //     res.status(401).json({ message: "Token không hợp lệ, vui lòng đăng nhập lại" });
  //   }
  // }

  // ====== LOGOUT ======
  async logout(req, res) {
    try {
      // Clear access token cookie
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
      
      // Clear refresh token cookie if exists
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
      
      res.status(200).json({ message: "Đã đăng xuất thành công" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại." });
    }
  }

  // ====== FORGOT PASSWORD ======
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      console.log('Forgot password request for email:', email);
      
      if (!email) {
        console.log('Email is missing in request');
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng nhập địa chỉ email của bạn" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({ 
          success: false, 
          message: "Địa chỉ email không đúng định dạng" 
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email);
        // Không tiết lộ thông tin user có tồn tại hay không
        return res.status(200).json({ 
          success: true,
          message: "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu" 
        });
      }

      // Tạo reset token và lưu vào database
      console.log('Generating reset token for user:', user._id);
      const resetToken = generatePasswordResetToken();
      user.password_reset_token = resetToken;
      user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
      await user.save();
      console.log('Reset token saved to database for user:', user._id);

      try {
        // Gửi email reset password
        console.log('Sending password reset email to:', email);
        const emailSent = await sendPasswordResetEmail(email, resetToken);
        
        if (!emailSent) {
          console.error('Failed to send password reset email to:', email);
          return res.status(500).json({ 
            success: false,
            message: "Có lỗi khi gửi email. Vui lòng thử lại sau." 
          });
        }

        console.log('Password reset email sent successfully to:', email);
        res.status(200).json({ 
          success: true,
          message: "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn." 
        });
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        res.status(500).json({ 
          success: false,
          message: "Có lỗi khi gửi email. Vui lòng thử lại sau." 
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false,
        message: "Có lỗi xảy ra trong quá trình xử lý yêu cầu. Vui lòng thử lại sau." 
      });
    }
  }

  // ====== RESET PASSWORD ======
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Thiếu thông tin cần thiết. Vui lòng nhập đầy đủ mật khẩu mới." 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: "Mật khẩu phải có ít nhất 6 ký tự để đảm bảo an toàn" 
        });
      }

      // Tìm user với token hợp lệ và chưa hết hạn
      const user = await User.findOne({
        password_reset_token: token,
        password_reset_expires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới." 
        });
      }

      // Cập nhật mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.password_reset_token = undefined;
      user.password_reset_expires = undefined;
      await user.save();

      res.status(200).json({ 
        success: true,
        message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới." 
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false,
        message: "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại hoặc yêu cầu mã mới." 
      });
    }
  }

  // ====== VERIFY RESET TOKEN ======
  async verifyResetToken(req, res) {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: "Token không hợp lệ" 
        });
      }

      const user = await User.findOne({
        password_reset_token: token,
        password_reset_expires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: "Token không hợp lệ hoặc đã hết hạn" 
        });
      }

      res.status(200).json({ 
        success: true,
        message: "Token hợp lệ" 
      });
    } catch (error) {
      console.error('Verify reset token error:', error);
      res.status(500).json({ 
        success: false,
        message: "Có lỗi xảy ra khi xác thực token" 
      });
    }
  }
}

export default new AuthController();
      