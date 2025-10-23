import express from "express";
import AuthController from "../../controllers/AuthController.js";
import { authenticate } from "../../middlewares/checkToken.js";
import catchAsync from "../../middlewares/catchAsync.js";
import crypto from "crypto";


const router = express.Router();

// ===== Rate limiting (express-rate-limit if available, fallback simple limiter) =====
let rateLimit;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  rateLimit = require('express-rate-limit');
} catch (e) {
  rateLimit = null;
}

// Fallback simple in-memory limiter
function simpleLimiter({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip + ':' + (req.path || '');
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= max) {
      return res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
    }
    list.push(now);
    hits.set(key, list);
    next();
  };
}

const loginLimiter = rateLimit
  ? rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false,
      message: { success: false, message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút' } })
  : simpleLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

const registerLimiter = rateLimit
  ? rateLimit({ windowMs: 60 * 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false,
      message: { success: false, message: 'Quá nhiều tài khoản được tạo từ IP này. Vui lòng thử lại sau' } })
  : simpleLimiter({ windowMs: 60 * 60 * 1000, max: 3 });

const passwordResetLimiter = rateLimit
  ? rateLimit({ windowMs: 60 * 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false,
      message: { success: false, message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau' } })
  : simpleLimiter({ windowMs: 60 * 60 * 1000, max: 3 });

// ===== CSRF setup =====
// Issue CSRF token and store in session
router.get("/csrf-token", (req, res) => {
  try {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    if (!req.session) {
      return res.status(500).json({ success: false, message: "Session is not available" });
    }
    req.session.csrfToken = csrfToken;
    return res.status(200).json({ success: true, csrfToken });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to generate CSRF token" });
  }
});

// Verify CSRF token for state-changing requests
function verifyCsrf(req, res, next) {
  try {
    const method = (req.method || "GET").toUpperCase();
    // Only enforce for non-GET/HEAD requests
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return next();
    }
    if (!req.session) {
      return res.status(500).json({ success: false, message: "Session not initialized" });
    }
    const headerToken = req.headers["x-csrf-token"];
    const sessionToken = req.session.csrfToken;
    if (!headerToken || !sessionToken || headerToken !== sessionToken) {
      return res.status(403).json({ success: false, message: "CSRF token mismatch" });
    }
    return next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "CSRF validation failed" });
  }
}

// Public
router.post("/register", registerLimiter, verifyCsrf, catchAsync(AuthController.register));
router.get("/verify-email", catchAsync(AuthController.verifyEmail)); // Đã thay đổi từ /:token sang ?token= query param
router.post("/resend-verification", registerLimiter, verifyCsrf, catchAsync(AuthController.resendVerificationEmail));
router.post("/login", loginLimiter, verifyCsrf, catchAsync(AuthController.login));
router.post("/forgot-password", passwordResetLimiter, verifyCsrf, catchAsync(AuthController.forgotPassword));
router.get("/verify-reset-token", catchAsync(AuthController.verifyResetToken));
router.post("/reset-password", passwordResetLimiter, verifyCsrf, catchAsync(AuthController.resetPassword));
// Áp dụng verifyCsrf để chống CSRF cho refresh-token (double-submit token)
router.post("/refresh-token", verifyCsrf, catchAsync(AuthController.refreshToken));
router.post("/logout", catchAsync(AuthController.logout)); // Không cần authenticate

// Protected
// router.post("/logout", authenticate, catchAsync(AuthController.logout));

export default router;
