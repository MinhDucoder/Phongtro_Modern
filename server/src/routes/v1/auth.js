import express from "express";
import AuthController from "~/controllers/AuthController.js";
import { authenticate } from "~/middlewares/checkToken.js";
import catchAsync from "~/middlewares/catchAsync.js";

const router = express.Router();

// Public
router.post("/register", catchAsync(AuthController.register));
router.get("/verify-email/:token", catchAsync(AuthController.verifyEmail));
router.post("/login", catchAsync(AuthController.login));
router.post("/refresh-token", catchAsync(AuthController.refreshToken));

// Protected
router.post("/logout", authenticate, catchAsync(AuthController.logout));

export default router;
