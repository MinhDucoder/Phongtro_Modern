import express from "express";
import jwt from "jsonwebtoken";
import UserController from "~/controllers/UserController.js";
import { authenticate, authorize } from "~/middlewares/checkToken.js";
import UploadController from "~/controllers/UploadController";
import uploadMiddleware from "../../middlewares/uploadMiddleware.js";
import { cleanupUploads } from "../../middlewares/uploadMiddleware.js";

const userRoute = express.Router();

// API /me để lấy thông tin user từ JWT token
userRoute.get("/me", (req, res) => {
  try {
    console.log('GET /me - Headers:', req.headers);
    console.log('GET /me - Cookies:', req.cookies);
    
    const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    
    if (!accessToken) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'asdfsadfsadf');
    console.log('GET /me - Decoded token:', decoded);
    
    // Trả về thông tin user từ JWT token
    res.json({
      success: true,
      user: {
        _id: decoded.id,
        full_name: decoded.full_name,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('GET /me error:', error);
    res.status(401).json({ message: "Token không hợp lệ" });
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



export default userRoute;
