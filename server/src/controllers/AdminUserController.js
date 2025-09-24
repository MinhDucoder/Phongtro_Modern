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
    const filter = {};
    
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status) {
      if (status === 'active') {
        filter.is_banned = false;
      } else if (status === 'banned') {
        filter.is_banned = true;
      } else if (status === 'verified') {
        filter.is_verified = true;
      } else if (status === 'unverified') {
        filter.is_verified = false;
      }
    }

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

    // Statistics
    const stats = await User.aggregate([
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

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Soft delete - có thể thêm trường deleted_at
    await User.findByIdAndUpdate(id, {
      is_deleted: true,
      deleted_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Đã xóa user thành công'
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
}

export default new AdminUserController();