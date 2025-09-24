import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "~/models/userSchema.js";
import dotenv from "dotenv";
import fs from "fs/promises";
import { generateVerificationToken, sendVerificationEmail, generatePasswordResetToken, sendPasswordResetEmail } from '~/services/emailService.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

class AuthController {
  // REGISTER
  async register(req, res) {
    const { full_name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

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
      if (!user) return res.status(401).json({ message: "Email không tồn tại" });

      if (!user.password) {
        console.error('No password found for user:', email);
        return res.status(500).json({ success: false, message: "Lỗi xác thực" });
      }

      // Kiểm tra xác thực email
      if (!user.is_verified) {
        return res.status(403).json({ 
          success: false, 
          message: "Vui lòng xác thực email trước khi đăng nhập",
          needVerification: true,
          email: user.email
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

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

      // Set cookie with proper options
      res.cookie("accessToken", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: 'lax',
        path: '/',
        maxAge: 7*24*60*60*1000 // 7 days
      });

      res.status(200).json({ 
        success: true,
        message: "Đăng nhập thành công", 
        token, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: "Có lỗi xảy ra khi đăng nhập" });
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
      
      res.status(200).json({ message: "Đã đăng xuất" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Có lỗi xảy ra khi đăng xuất" });
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
          message: "Vui lòng nhập địa chỉ email" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({ 
          success: false, 
          message: "Địa chỉ email không hợp lệ" 
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
        message: "Có lỗi xảy ra. Vui lòng thử lại sau." 
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
          message: "Token và mật khẩu mới là bắt buộc" 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: "Mật khẩu phải có ít nhất 6 ký tự" 
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
        message: "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau." 
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
      