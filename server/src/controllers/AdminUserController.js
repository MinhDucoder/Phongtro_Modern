import User from "../models/userSchema.js";
import catchAsync from "../middlewares/catchAsync.js";
import { getOrSetCache, deleteCacheByPrefix } from "../services/redisService.js";

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

    // 🔹 Cache key based on query params
    const cacheKey = `admin:users:list:p${page}:l${limit}:s${search || 'all'}:r${role || 'all'}:st${status || 'all'}:sort${sortBy}:${sortOrder}`;
    
    const result = await getOrSetCache(
      cacheKey,
      async () => {

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
      
      if (status === 'verified') {
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
          verifiedUsers: { $sum: { $cond: [{ $eq: ["$is_verified", true] }, 1, 0] } },
          unverifiedUsers: { $sum: { $cond: [{ $eq: ["$is_verified", false] }, 1, 0] } },
          landlords: { $sum: { $cond: [{ $eq: ["$role", "landlord"] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
        }
      }
    ]);

        return {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            totalUsers,
            limit: parseInt(limit)
          },
          statistics: stats[0] || {
            totalUsers: 0,
            verifiedUsers: 0,
            unverifiedUsers: 0,
            landlords: 0,
            regularUsers: 0
          }
        };
      },
      300 // TTL 5 phút cho user list
    );

    res.status(200).json({
      success: true,
      data: result
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

    // Initialize stats and activities arrays
    let userStats = {
      totalPosts: 0,
      totalBookings: 0,
      totalTransactions: 0,
      totalReviews: 0,
      averageRating: 0,
      totalSpent: 0
    };

    let userActivities = [];

    try {
      // Try to get post statistics if Post model exists
      const Post = await import('~/models/postSchema.js').then(m => m.default).catch(() => null);
      if (Post) {
        userStats.totalPosts = await Post.countDocuments({ 
          user: id, 
          is_deleted: { $ne: true } 
        });
      }

      // Try to get booking statistics if Booking model exists  
      const Booking = await import('~/models/bookingSchema.js').then(m => m.default).catch(() => null);
      if (Booking) {
        userStats.totalBookings = await Booking.countDocuments({ user: id });
      }

      // Try to get transaction statistics if Transaction model exists
      const Transaction = await import('~/models/transactionSchema.js').then(m => m.default).catch(() => null);
      if (Transaction) {
        const transactions = await Transaction.find({ user: id });
        userStats.totalTransactions = transactions.length;
        userStats.totalSpent = transactions.reduce((total, t) => total + (t.amount || 0), 0);
      }

      // Try to get review statistics if Review model exists
      const Review = await import('~/models/reviewSchema.js').then(m => m.default).catch(() => null);
      if (Review) {
        const reviews = await Review.find({ user: id });
        userStats.totalReviews = reviews.length;
        if (reviews.length > 0) {
          userStats.averageRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
        }
      }

      // Create some sample activities based on user data
      userActivities = [
        {
          date: user.created_at,
          action: 'account_created',
          description: 'Tài khoản được tạo',
          ip_address: 'N/A'
        }
      ];

      if (user.last_login) {
        userActivities.unshift({
          date: user.last_login,
          action: 'login',
          description: 'Đăng nhập lần cuối',
          ip_address: 'N/A'
        });
      }

      if (user.is_verified) {
        userActivities.push({
          date: user.created_at, // Use creation date as proxy
          action: 'email_verified',
          description: 'Email được xác thực',
          ip_address: 'N/A'
        });
      }

      // Sort activities by date (newest first)
      userActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
    } catch (error) {
      console.log('Error getting user statistics:', error.message);
      // Continue with default empty stats
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: userStats,
        activities: userActivities.slice(0, 10) // Limit to 10 most recent activities
      }
    });
  });

  // Cập nhật thông tin user
  updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { 
      full_name, 
      email, 
      phone, 
      address,
      role, 
      is_verified
    } = req.body;

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

    // Prepare update data
    const updateData = {
      full_name,
      email,
      phone,
      address,
      role,
      is_verified
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refresh_token -verification_token -password_reset_token');

    // ❌ Clear cache sau khi update
    await deleteCacheByPrefix('admin:users:');
    await deleteCacheByPrefix('admin:dashboard:');

    res.status(200).json({
      success: true,
      message: 'Cập nhật user thành công',
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
        
        // ❌ Clear cache sau khi delete
        await deleteCacheByPrefix('admin:users:');
        await deleteCacheByPrefix('admin:dashboard:');
        
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
          
          // ❌ Clear cache sau khi delete
          await deleteCacheByPrefix('admin:users:');
          await deleteCacheByPrefix('admin:dashboard:');
          
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