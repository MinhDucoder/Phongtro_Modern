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
      const { full_name, phone, avatar, address, dateOfBirth, gender, bio } = req.body;

      // Build update object with only provided fields
      const updateData = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (address !== undefined) updateData.address = address;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (gender !== undefined) updateData.gender = gender;
      if (bio !== undefined) updateData.bio = bio;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password -refresh_token -verification_token");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
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

  // [POST] /user/avatar - Upload avatar
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "Không có file được upload" 
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          success: false,
          message: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF)" 
        });
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          success: false,
          message: "Kích thước file không được vượt quá 5MB" 
        });
      }

      // Upload to Cloudinary
      const uploadService = (await import('../services/uploadService.js')).default;
      const result = await uploadService.uploadFile(
        req.file.path,
        "UserAvatars"
      );

      // Update user avatar
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: result.url },
        { new: true, runValidators: true }
      ).select("-password -refresh_token -verification_token");

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Không tìm thấy user" 
        });
      }

      res.json({
        success: true,
        message: "Upload ảnh đại diện thành công",
        data: {
          avatar: result.url,
          user: user
        }
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Có lỗi xảy ra khi upload ảnh đại diện" 
      });
    }
  }

  // [DELETE] /user/avatar - Remove avatar
  async removeAvatar(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Không tìm thấy user" 
        });
      }

      // Update user to remove avatar
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $unset: { avatar: 1 } },
        { new: true, runValidators: true }
      ).select("-password -refresh_token -verification_token");

      res.json({
        success: true,
        message: "Xóa ảnh đại diện thành công",
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Remove avatar error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Có lỗi xảy ra khi xóa ảnh đại diện" 
      });
    }
  }
}

export default new UserController();
