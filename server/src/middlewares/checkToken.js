import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware kiểm tra token
export const authenticate = () => {
  return async (req, res, next) => {
    try {
      const path = req.path.toLowerCase();
      if (path === "/login" || path === "/register" || path === "/logout") {
        return next();
      }

      const accessToken =
        req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

      if (!accessToken) {
        return res.status(401).json({ message: "Vui lòng đăng nhập" });
      }

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  };
};

// middlewares/authorize.js
export const authorize = (roles = []) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]; // ép luôn thành mảng

  return (req, res, next) => {
    try {
      // Chưa login
      if (!req.user) {
        return res.status(401).json({ message: "Vui lòng đăng nhập" });
      }

      const userRole = req.user.role || null;

      // Nếu có truyền roles mà user không thuộc nhóm đó
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
      }

      // Hợp lệ
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi xác thực quyền",
        error: error.message,
      });
    }
  };
};
