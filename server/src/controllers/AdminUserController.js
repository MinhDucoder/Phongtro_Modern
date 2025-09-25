import User from "~/models/userSchema.js";
import catchAsync from "~/middlewares/catchAsync.js";

class AdminUserController {
  // Lấy danh sách tất cả users với phân trang và filter
  getAllUsers = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {
      is_deleted: { $ne: true } // Always filter out deleted users by default
    };
    
    console.log("Original query parameters:", req.query);
    
    // Search filter - combined search on name, email, phone
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      console.log(`Applying role filter: ${role}`);
      filter.role = role;
    }

    // Status filter
    if (status && status !== 'all') {
      console.log(`Applying status filter: ${status}`);
      
      if (status === 'active') {
        filter.is_banned = false;
      } else if (status === 'banned') {
        filter.is_banned = true;
      } else if (status === 'verified') {
        filter.is_verified = true;
      } else if (status === 'unverified') {
        filter.is_verified = false;
      } else if (status === 'deleted') {
        filter.is_deleted = true; // Allow viewing deleted users with explicit filter
        delete filter['is_deleted']; // Remove the previous filter
      }
    }
    
    console.log("Applied filter:", JSON.stringify(filter, null, 2));

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password -refresh_token -verification_token -password_reset_token')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Statistics - exclude deleted users from counts
    const stats = await User.aggregate([
      {
        $match: { 
          is_deleted: { $ne: true } // Exclude deleted users from statistics 
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ["$is_banned", false] }, 1, 0] } },
          bannedUsers: { $sum: { $cond: [{ $eq: ["$is_banned", true] }, 1, 0] } },
          verifiedUsers: { $sum: { $cond: [{ $eq: ["$is_verified", true] }, 1, 0] } },
          landlords: { $sum: { $cond: [{ $eq: ["$role", "landlord"] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit)
        },
        statistics: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          verifiedUsers: 0,
          landlords: 0,
          regularUsers: 0
        }
      }
    });
  });

  // Lấy chi tiết một user
  getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -refresh_token -verification_token -password_reset_token');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Lấy thống kê bài đăng của user (nếu có)
    // TODO: Thêm logic lấy số bài đăng khi có Post model

    res.status(200).json({
      success: true,
      data: user
    });
  });

  // Cập nhật thông tin user
  updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone, role, is_verified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Kiểm tra email đã tồn tại chưa (nếu thay đổi email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        full_name,
        email,
        phone,
        role,
        is_verified
      },
      { new: true, runValidators: true }
    ).select('-password -refresh_token -verification_token -password_reset_token');

    res.status(200).json({
      success: true,
      message: 'Cập nhật user thành công',
      data: updatedUser
    });
  });

  // Ban/Unban user
  toggleBanUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    const newBanStatus = !user.is_banned;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        is_banned: newBanStatus,
        ban_reason: newBanStatus ? reason : undefined,
        banned_at: newBanStatus ? new Date() : undefined
      },
      { new: true }
    ).select('-password -refresh_token -verification_token -password_reset_token');

    res.status(200).json({
      success: true,
      message: newBanStatus ? 'Đã cấm user' : 'Đã bỏ cấm user',
      data: updatedUser
    });
  });

  // Xóa user (soft delete)
  deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete user with ID: ${id}`);

    try {
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        console.log(`User with ID ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }

      console.log(`Found user to delete: ${user.email}`);

      // Check if already deleted
      if (user.is_deleted) {
        console.log(`User ${id} is already deleted`);
        return res.status(400).json({
          success: false,
          message: 'User này đã bị xóa trước đó'
        });
      }

      // Soft delete using direct update to ensure it works
      console.log("Performing soft delete operation");
      const updateResult = await User.updateOne(
        { _id: id },
        { 
          $set: {
            is_deleted: true,
            deleted_at: new Date()
          }
        }
      );
      
      console.log("Soft delete operation result:", updateResult);
      
      if (updateResult.modifiedCount === 1) {
        console.log(`User ${id} has been successfully soft-deleted`);
        
        // Fetch the updated user to return
        const deletedUser = await User.findById(id);
        
        return res.status(200).json({
          success: true,
          message: 'Đã xóa user thành công',
          data: deletedUser
        });
      } else {
        // If updateOne didn't work, try with findByIdAndUpdate as fallback
        console.log("updateOne failed, trying findByIdAndUpdate as fallback");
        const deletedUser = await User.findByIdAndUpdate(id, {
          is_deleted: true,
          deleted_at: new Date()
        }, { new: true });
        
        if (deletedUser) {
          console.log(`User soft-deleted with fallback: ${deletedUser.email}, deleted status: ${deletedUser.is_deleted}`);
          
          return res.status(200).json({
            success: true,
            message: 'Đã xóa user thành công (fallback method)',
            data: deletedUser
          });
        } else {
          throw new Error('Failed to delete user with both methods');
        }
      }
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa user: ' + error.message
      });
    }
    
    // TODO: You might want to also handle related data like:
    // 1. Set posts inactive
    // 2. Cancel active bookings
    // 3. etc.

    res.status(200).json({
      success: true,
      message: 'Đã xóa user thành công',
      data: {
        userId: id,
        deleted: true,
        timestamp: new Date()
      }
    });
  });

  // Lấy hoạt động gần đây của users
  getRecentActivities = catchAsync(async (req, res) => {
    const { limit = 20 } = req.query;

    const recentUsers = await User.find({ is_deleted: { $ne: true } })
      .select('full_name email role created_at last_login is_verified is_banned')
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recentUsers
    });
  });

  // Hard delete a user (Admin only) - This should be used with extreme caution
  hardDeleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to HARD DELETE user with ID: ${id}`);
    
    // Only allow this from admin accounts
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thực hiện thao tác này'
      });
    }
    
    // Verify this is intentional with a confirmation code
    const { confirmation } = req.body;
    if (confirmation !== 'HARD_DELETE_CONFIRM') {
      return res.status(400).json({
        success: false,
        message: 'Xác nhận xóa không hợp lệ. Cần mã xác nhận để xóa vĩnh viễn.'
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    // Actually delete from database using deleteOne for better reliability
    const deleteResult = await User.deleteOne({ _id: id });
    
    console.log(`User ${id} hard delete result:`, deleteResult);
    
    if (deleteResult.deletedCount !== 1) {
      console.error(`Failed to delete user ${id} - no documents were deleted`);
      return res.status(500).json({
        success: false,
        message: 'Xóa không thành công, không tìm thấy user để xóa'
      });
    }
    
    console.log(`User ${id} hard deleted from database`);
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa vĩnh viễn user khỏi cơ sở dữ liệu',
    });
  });
}

export default new AdminUserController();