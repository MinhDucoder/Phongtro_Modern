import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware kiểm tra token
export const authenticate = () => {
  return async (req, res, next) => {
    try {
      const path = req.path.toLowerCase();
      if (path === "/login" || path === "/register") {
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



export const authorize = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    next();
  };
};
