import express from "express";
import UserController from "~/controllers/UserController.js";
import { authenticate, authorize } from "~/middlewares/checkToken.js";
import UploadController from "~/controllers/UploadController";
import uploadMiddleware from "../../middlewares/uploadMiddleware.js";
import { cleanupUploads } from "../../middlewares/uploadMiddleware.js";

const userRoute = express.Router();

userRoute.get("/profile", authenticate, UserController.getProfile);
userRoute.patch("/update", authenticate, UserController.updateProfile);
userRoute.patch(
  "/change-password",
  authenticate,
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

userRoute.get("/activity", authenticate, UserController.getActivity);
userRoute.delete("/delete", authenticate, UserController.deleteAccount);

export default userRoute;
