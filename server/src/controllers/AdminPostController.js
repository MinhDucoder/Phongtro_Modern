import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import catchAsync from "../middlewares/catchAsync.js";

class AdminPostController {
  // Lấy danh sách tất cả posts với phân trang và filter
  getAllPosts = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      favouriteLevel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      landlordId
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (favouriteLevel && favouriteLevel !== 'all') {
      filter.favouriteLevel = favouriteLevel;
    }

    if (landlordId) {
      filter.landlord = landlordId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = Post.find(filter)
      .populate({
        path: 'landlord',
        select: 'full_name email phone role is_verified is_banned'
      })
      .populate({
        path: 'roomId',
        select: 'title address price images area status'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add search functionality if needed
    if (search) {
      const roomFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      };
      const rooms = await Room.find(roomFilter).select('_id');
      const roomIds = rooms.map(room => room._id);
      
      if (roomIds.length > 0) {
        filter.roomId = { $in: roomIds };
      } else {
        // No rooms found, so no posts will match
        query = Post.find({ _id: { $exists: false } });
      }
    }

    const [posts, totalPosts] = await Promise.all([
      query,
      Post.countDocuments(filter)
    ]);

    // Statistics
    const stats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          activePosts: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          pendingPosts: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          expiredPosts: { $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] } },
          freePosts: { $sum: { $cond: [{ $eq: ["$favouriteLevel", "free"] }, 1, 0] } },
          silverPosts: { $sum: { $cond: [{ $eq: ["$favouriteLevel", "silver"] }, 1, 0] } },
          goldPosts: { $sum: { $cond: [{ $eq: ["$favouriteLevel", "gold"] }, 1, 0] } },
          platinumPosts: { $sum: { $cond: [{ $eq: ["$favouriteLevel", "platinum"] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / parseInt(limit)),
          totalPosts,
          limit: parseInt(limit)
        },
        statistics: stats[0] || {
          totalPosts: 0,
          activePosts: 0,
          pendingPosts: 0,
          expiredPosts: 0,
          freePosts: 0,
          silverPosts: 0,
          goldPosts: 0,
          platinumPosts: 0
        }
      }
    });
  });

  // Lấy chi tiết một post
  getPostById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate({
        path: 'landlord',
        select: 'full_name email phone role is_verified is_banned created_at'
      })
      .populate({
        path: 'roomId'
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  });

  // Cập nhật trạng thái post (approve/reject)
  updatePostStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }

    const updateData = { 
      status,
      moderatedAt: new Date(),
      moderatedBy: req.user._id
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('landlord', 'full_name email')
     .populate('roomId', 'title');

    // TODO: Gửi notification cho landlord
    
    res.status(200).json({
      success: true,
      message: `Bài đăng đã được ${status === 'active' ? 'duyệt' : 'từ chối'}`,
      data: updatedPost
    });
  });

  // Cập nhật favourite level
  updateFavouriteLevel = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { favouriteLevel } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { favouriteLevel },
      { new: true }
    ).populate('landlord', 'full_name email')
     .populate('roomId', 'title');

    res.status(200).json({
      success: true,
      message: 'Cập nhật cấp độ ưu tiên thành công',
      data: updatedPost
    });
  });

  // Xóa post
  deletePost = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }

    // Soft delete
    await Post.findByIdAndUpdate(id, {
      is_deleted: true,
      deleted_at: new Date(),
      deletion_reason: reason,
      deleted_by: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Đã xóa bài đăng thành công'
    });
  });

  // Lấy posts cần kiểm duyệt
  getPendingPosts = catchAsync(async (req, res) => {
    const { limit = 20 } = req.query;

    const pendingPosts = await Post.find({ status: 'pending' })
      .populate({
        path: 'landlord',
        select: 'full_name email is_verified'
      })
      .populate({
        path: 'roomId',
        select: 'title address price images'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: pendingPosts
    });
  });

  // Bulk actions
  bulkUpdatePosts = catchAsync(async (req, res) => {
    const { postIds, action, data } = req.body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một bài đăng'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { 
          status: 'active',
          moderatedAt: new Date(),
          moderatedBy: req.user._id
        };
        message = 'Đã duyệt các bài đăng thành công';
        break;
        
      case 'reject':
        updateData = { 
          status: 'rejected',
          moderatedAt: new Date(),
          moderatedBy: req.user._id,
          rejectionReason: data?.reason || 'Không phù hợp với quy định'
        };
        message = 'Đã từ chối các bài đăng thành công';
        break;
        
      case 'delete':
        updateData = {
          is_deleted: true,
          deleted_at: new Date(),
          deletion_reason: data?.reason || 'Vi phạm quy định',
          deleted_by: req.user._id
        };
        message = 'Đã xóa các bài đăng thành công';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Hành động không hợp lệ'
        });
    }

    const result = await Post.updateMany(
      { _id: { $in: postIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  });

  // Analytics
  getPostAnalytics = catchAsync(async (req, res) => {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const analytics = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalPosts: { $sum: 1 },
          activePosts: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          pendingPosts: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics
    });
  });
}

export default new AdminPostController();