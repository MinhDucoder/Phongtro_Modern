import express from "express";
import jwt from "jsonwebtoken";
import UserController from "../../controllers/UserController.js";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import UploadController from "../../controllers/UploadController.js";
import uploadMiddleware from "../../middlewares/uploadMiddleware.js";
import { cleanupUploads } from "../../middlewares/uploadMiddleware.js";
import UserSettingsController from "../../controllers/UserSettingsController.js";
import { cacheMiddleware } from "../../middlewares/cacheMiddleware.js";

const userRoute = express.Router();

// API /me để lấy thông tin user từ JWT token và database (tối ưu + cache)
userRoute.get("/me", authenticate(), cacheMiddleware(30), async (req, res) => {
  try {
    console.log('GET /me - User ID:', req.user.id);
    
    // Lấy thông tin user đầy đủ từ database với tối ưu
    const User = (await import("../../models/userSchema.js")).default;
    const user = await User.findById(req.user.id)
      .select("-password -refresh_token -verification_token -google_id -facebook_id")
      .lean() // Sử dụng lean() để tăng tốc độ
      .exec();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('GET /me - User found:', {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
    
    // Trả về thông tin user đầy đủ từ database
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('GET /me error:', error);
    res.status(500).json({ message: error.message });
  }
});

userRoute.get("/profile", (req, res, next) => {
  console.log('GET /profile - Headers:', req.headers);
  console.log('GET /profile - Cookies:', req.cookies);
  next();
}, authenticate(), UserController.getProfile);
userRoute.patch("/update", authenticate(), UserController.updateProfile);
userRoute.patch(
  "/change-password",
  authenticate(),
  UserController.changePassword
);
userRoute.put(
  "/avatar",
  authenticate(),
  authorize(["user", "landlord"]),
  uploadMiddleware.single("avatar"),
  cleanupUploads,
  UserController.updateAvatar
);

userRoute.get("/activity", authenticate(), UserController.getActivity);
userRoute.delete("/delete", authenticate(), UserController.deleteAccount);

// User settings routes
userRoute.get(
  "/settings",
  authenticate(),
  UserSettingsController.getUserSettings
);

userRoute.put(
  "/settings",
  authenticate(),
  UserSettingsController.updateUserSettings
);

userRoute.put(
  "/settings/notifications",
  authenticate(),
  UserSettingsController.updateNotificationSettings
);

userRoute.put(
  "/settings/privacy",
  authenticate(),
  UserSettingsController.updatePrivacySettings
);

userRoute.put(
  "/settings/security",
  authenticate(),
  UserSettingsController.updateSecuritySettings
);

userRoute.put(
  "/settings/display",
  authenticate(),
  UserSettingsController.updateDisplaySettings
);

userRoute.post(
  "/settings/reset",
  authenticate(),
  UserSettingsController.resetSettings
);

// Avatar upload routes
userRoute.post(
  "/avatar",
  authenticate(),
  uploadMiddleware.single('avatar'),
  UserController.uploadAvatar
);

userRoute.delete(
  "/avatar",
  authenticate(),
  UserController.removeAvatar
);

export default userRoute;
