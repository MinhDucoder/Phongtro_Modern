import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "~/models/userSchema.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

class AuthController {
  // REGISTER với email verification
  async register(req, res) {
    const { full_name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    console.log(existingUser)
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verification_token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      phone,
      verification_token,
    });

    await newUser.save();

    // // Gửi email verify (ví dụ dùng nodemailer)
    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    // });

    // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verification_token}`;

    // await transporter.sendMail({
    //   from: `"YourApp" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "Xác thực email",
    //   html: `<p>Click link để xác thực email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    // });

    res.status(201).json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực." });
  }

  // Email verification
  async verifyEmail(req, res) {
    const { token } = req.params;
    const user = await User.findOne({ verification_token: token });
    if (!user) return res.status(400).json({ message: "Token không hợp lệ" });

    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();

    res.json({ message: "Email đã được xác thực, bạn có thể đăng nhập." });
  }

  // LOGIN với refresh token
  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email không tồn tại" });
    // if (!user.is_verified) return res.status(403).json({ message: "Vui lòng xác thực email trước khi login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    // const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

    user.last_login = new Date();
    // user.refresh_token = refreshToken;
    await user.save();

    res.cookie("accessToken", token, { httpOnly: true, secure: true, maxAge: 7*24*60*60*1000 });
    // res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7*24*60*60*1000 });
    res.json({ message: "Login thành công", token });
  }

  // Refresh token endpoint
  async refreshToken(req, res) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "Vui lòng đăng nhập lại" });

    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await User.findById(payload.id);
      if (!user || user.refresh_token !== refreshToken) throw new Error();

      const newToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
      res.json({ token: newToken });
    } catch {
      res.status(401).json({ message: "Token không hợp lệ, vui lòng đăng nhập lại" });
    }
  }

  // LOGOUT
  async logout(req, res) {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const user = await User.findOne({ refresh_token: refreshToken });
      if (user) {
        user.refresh_token = undefined;
        await user.save();
      }
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logout thành công" });
  }
}

export default new AuthController();
