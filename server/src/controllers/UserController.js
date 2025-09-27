import bcrypt from "bcrypt";
import User from "../models/userSchema.js";
import uploadService from "../services/uploadService.js";
import fs from "fs/promises";

class UserController {
  // [GET] /user/profile
  async getProfile(req, res) {
    try {
      console.log('getProfile - req.user.id:', req.user.id);
      const user = await User.findById(req.user.id).select(
        "-password -refresh_token -verification_token"
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      console.log('getProfile - user found:', {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      });
      res.json(user);
    } catch (error) {
      console.error('getProfile error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // [PATCH] /user/update
  async updateProfile(req, res) {
    try {
      const { full_name, phone, avatar } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { full_name, phone, avatar },
        { new: true, runValidators: true }
      ).select("-password -refresh_token -verification_token");

      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // [PATCH] /user/change-password
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      if (!user) return res.status(404).json({ message: "User not found" });

      // Check if user has a password
      if (!user.password) {
        return res.status(400).json({ message: "User does not have a password set. Please reset your password." });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // [PATCH] /user/avatar
  async updateAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await uploadService.uploadFile(
        req.file.path,
        "UserAvatars"
      );

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: { url: result.url, public_id: result.public_id } }, // lưu cả public_id nếu cần
        { new: true }
      );


      res.json({
        message: "Cập nhật avatar thành công",
        avatar: result.url,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /user/activity
  async getActivity(req, res) {
    try {
      // TODO: thay bằng collection Activity thực tế, ở đây mock tạm
      const activities = [
        { action: "Login", timestamp: new Date().toISOString() },
        { action: "Update profile", timestamp: new Date().toISOString() },
      ];
      res.json({ activities });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // [DELETE] /user/delete
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(403).json({ message: "Password is incorrect" });

      user.is_banned = true; // deactivate
      await user.save();

      res.json({ message: "Account deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();
