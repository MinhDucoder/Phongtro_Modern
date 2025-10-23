import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userSchema from "../models/userSchema.js";
import { getCache, existsCache } from "../services/redisService.js";
import { createHash } from "crypto";
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

      // Giảm rò rỉ thông tin nhạy cảm trong log
      try {
        const safeCookieInfo = Array.isArray(Object.keys(req.cookies || {}))
          ? Object.keys(req.cookies || {}).map((k) => ({
              name: k,
              length: typeof req.cookies[k] === 'string' ? req.cookies[k].length : undefined,
            }))
          : [];
        console.log("authenticate middleware:", {
          path: req.path,
          cookies: safeCookieInfo, // chỉ log tên và độ dài
          accessToken: accessToken ? "exists" : "missing",
        });
      } catch (_) {
        console.log("authenticate middleware:", {
          path: req.path,
          accessToken: accessToken ? "exists" : "missing",
        });
      }

      if (!accessToken) {
        return res.status(401).json({ message: "Vui lòng đăng nhập" });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('Missing JWT_SECRET env');
      }
      // Check revoke: ưu tiên theo jti nếu có, O(1) EXISTS; fallback hash
      try {
        let revoked = false;
        try {
          const decodedPeek = jwt.decode(accessToken);
          if (decodedPeek && typeof decodedPeek === 'object' && decodedPeek.jti) {
            revoked = await existsCache(`revoked:access:${decodedPeek.jti}`);
          }
        } catch {}
        if (!revoked) {
          const tokenHash = createHash('sha256').update(accessToken).digest('hex');
          revoked = await existsCache(`blacklist:${tokenHash}`);
        }
        if (revoked) {
          return res.status(401).json({ message: "Token đã bị thu hồi. Vui lòng đăng nhập lại" });
        }
      } catch (e) {
        // ignore cache errors, proceed to verify
      }

      const decoded = jwt.verify(accessToken, jwtSecret);
      // Chỉ log metadata tối thiểu, không log toàn bộ token payload
      if (decoded && typeof decoded === 'object') {
        console.log("decoded token (safe):", {
          id: decoded.id,
          role: decoded.role,
          exp: decoded.exp,
        });
      }

      // TODO (optional): Nếu AT có jti, có thể thay blacklist per-token bằng revoked set per jti
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

export const socketAuth = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;
    if (!token) {
      // Try to read from cookie header if present
      const cookieHeader = socket.handshake.headers?.cookie || '';
      const match = cookieHeader.split('; ').find((c) => c.startsWith('accessToken='));
      if (match) {
        token = match.split('=')[1];
      }
    }
    if (!token) return next(new Error("Authentication error"));

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next(new Error('Missing JWT secret'));
    const decoded = jwt.verify(token, jwtSecret);
    const user = await userSchema.findById(decoded.id);
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
};
