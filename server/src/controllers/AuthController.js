import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "~/models/userSchema";

const JWT_SECRET = "your_jwt_secret"; // Nên để trong .env

class AuthController {
  // LOGIN
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Tìm user theo email
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Email không tồn tại" });

      // Kiểm tra password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

      // Cập nhật last_login
      user.last_login = new Date();
      await user.save();

      // Tạo JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ message: "Login thành công", token });
    } catch (error) {
      next(error);
    }
  }

  // REGISTER
  async register(req, res, next) {
    console.log(req.body)
    try {
      const { full_name, email, password, phone } = req.body;

      // Kiểm tra email tồn tại
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user mới
      const newUser = new User({
        full_name,
        email,
        password: hashedPassword,
        phone,
      });

      await newUser.save();

      res.status(201).json({ message: "Đăng ký thành công", userId: newUser._id });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
