import Post from "~/models/postSchema.js";
import User from "~/models/userSchema.js";
import Room from "~/models/roomSchema.js";
import catchAsync from "~/middlewares/catchAsync.js";

class ModerationController {
  // Dashboard tổng quan
  getModerationDashboard = catchAsync(async (req, res) => {
    const [
      pendingPosts,
      totalUsers,
      bannedUsers,
      recentReports,
      todayStats
    ] = await Promise.all([
      Post.countDocuments({ status: 'pending' }),
      User.countDocuments({ is_deleted: { $ne: true } }),
      User.countDocuments({ is_banned: true }),
      // TODO: Add Report model and count reports
      0, // Placeholder for reports
      Post.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        },
        {
          $group: {
            _id: null,
            newPosts: { $sum: 1 },
            pendingToday: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
            },
            approvedToday: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const todayStat = todayStats[0] || {
      newPosts: 0,
      pendingToday: 0,
      approvedToday: 0
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          pendingPosts,
          totalUsers,
          bannedUsers,
          recentReports
        },
        todayStats: todayStat
      }
    });
  });

  // Lấy queue kiểm duyệt
  getModerationQueue = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      priority = 'all', // all, high, normal, low
      type = 'all' // all, post, user, report
    } = req.query;

    let items = [];
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pending posts
    if (type === 'all' || type === 'post') {
      const posts = await Post.find({ 
        status: 'pending',
        is_deleted: { $ne: true }
      })
        .populate('landlord', 'full_name email is_verified')
        .populate('roomId', 'title address price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      items = items.concat(posts.map(post => ({
        ...post.toObject(),
        type: 'post',
        priority: this.calculatePostPriority(post),
        waitingTime: Date.now() - post.createdAt.getTime()
      })));
    }

    // Get reported users (if type includes users)
    if (type === 'all' || type === 'user') {
      // TODO: Add logic for reported users
    }

    // Sort by priority and waiting time
    items.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.waitingTime - a.waitingTime;
    });

    // Filter by priority if specified
    if (priority !== 'all') {
      items = items.filter(item => item.priority === priority);
    }

    const totalItems = items.length;
    const paginatedItems = items.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / parseInt(limit)),
          totalItems,
          limit: parseInt(limit)
        }
      }
    });
  });

  // Tính toán độ ưu tiên kiểm duyệt
  calculatePostPriority = (post) => {
    const waitingHours = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    const isVerifiedLandlord = post.landlord?.is_verified;
    const hasImages = post.roomId?.images?.length > 0;

    // High priority: waiting > 24h OR from verified landlord
    if (waitingHours > 24 || isVerifiedLandlord) {
      return 'high';
    }
    
    // Normal priority: has images OR waiting > 12h
    if (hasImages || waitingHours > 12) {
      return 'normal';
    }
    
    return 'low';
  };

  // Quick actions
  quickApprove = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    if (type === 'post') {
      const post = await Post.findByIdAndUpdate(
        id,
        {
          status: 'active',
          moderatedAt: new Date(),
          moderatedBy: req.user._id
        },
        { new: true }
      ).populate('landlord', 'full_name email');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài đăng'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Đã duyệt bài đăng thành công',
        data: post
      });
    }
  });

  // Quick reject
  quickReject = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type, reason } = req.body;

    if (type === 'post') {
      const post = await Post.findByIdAndUpdate(
        id,
        {
          status: 'rejected',
          moderatedAt: new Date(),
          moderatedBy: req.user._id,
          rejectionReason: reason || 'Không phù hợp với quy định'
        },
        { new: true }
      ).populate('landlord', 'full_name email');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài đăng'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Đã từ chối bài đăng thành công',
        data: post
      });
    }
  });

  // Bulk moderation actions
  bulkModerationAction = catchAsync(async (req, res) => {
    const { itemIds, action, reason, type = 'post' } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một mục'
      });
    }

    let result;
    let message = '';

    if (type === 'post') {
      const updateData = {
        moderatedAt: new Date(),
        moderatedBy: req.user._id
      };

      switch (action) {
        case 'approve':
          updateData.status = 'active';
          message = 'Đã duyệt các bài đăng thành công';
          break;
        case 'reject':
          updateData.status = 'rejected';
          updateData.rejectionReason = reason || 'Không phù hợp với quy định';
          message = 'Đã từ chối các bài đăng thành công';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Hành động không hợp lệ'
          });
      }

      result = await Post.updateMany(
        { _id: { $in: itemIds } },
        updateData
      );
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        modifiedCount: result?.modifiedCount || 0
      }
    });
  });

  // Moderation history
  getModerationHistory = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      moderatorId,
      type = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { moderatedBy: { $exists: true } };

    if (moderatorId) {
      filter.moderatedBy = moderatorId;
    }

    const history = await Post.find(filter)
      .populate('moderatedBy', 'full_name email')
      .populate('landlord', 'full_name email')
      .populate('roomId', 'title')
      .sort({ moderatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });
  });

  // Moderation statistics
  getModerationStats = catchAsync(async (req, res) => {
    const { period = '7d', moderatorId } = req.query;
    
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
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const matchFilter = {
      moderatedAt: { $gte: startDate, $lte: now }
    };

    if (moderatorId) {
      matchFilter.moderatedBy = moderatorId;
    }

    const stats = await Post.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            moderator: "$moderatedBy",
            status: "$status"
          },
          count: { $sum: 1 },
          avgProcessingTime: {
            $avg: {
              $subtract: ["$moderatedAt", "$createdAt"]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.moderator",
          foreignField: "_id",
          as: "moderatorInfo"
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

export default new ModerationController();