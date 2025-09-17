import express from "express";
import UserController from "~/controllers/UserController.js";
import { authenticate } from "~/middlewares/checkToken.js";

const userRoute = express.Router();

userRoute.get("/profile", authenticate, UserController.getProfile);
userRoute.patch("/update", authenticate, UserController.updateProfile);
userRoute.patch("/change-password", authenticate, UserController.changePassword);
userRoute.get("/activity", authenticate, UserController.getActivity);
userRoute.delete("/delete", authenticate, UserController.deleteAccount);

export default userRoute;
