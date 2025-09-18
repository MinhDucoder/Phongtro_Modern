import bcrypt from "bcrypt";
import User from "~/models/userSchema.js";
import uploadService from "~/services/uploadService";

class UserController {
  // [GET] /user/profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select(
        "-password -refresh_token -verification_token"
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
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
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
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

      await uploadService.deleteFile(user.avatar.public_id)

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
