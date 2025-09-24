// src/services/dashboardService.js
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import RentalRequest from "../models/rentalRequestSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import User from "../models/userSchema.js";

class DashboardService {
  // Get dashboard overview statistics
  async getDashboardOverview(userId) {
    try {
      // Get user's posts
      const userPosts = await Post.find({ landlord: userId })
        .populate('roomId')
        .lean();

      const postIds = userPosts.map(post => post._id);

      // Get rental requests for user's posts
      const rentalRequests = await RentalRequest.find({ 
        landlord: userId 
      }).lean();

      // Get today's analytics
      const today = new Date().toISOString().split('T')[0];
      const todayAnalytics = await PostAnalytics.find({
        landlord: userId,
        date: today
      }).lean();

      // Calculate statistics
      const stats = {
        totalPosts: userPosts.length,
        activePosts: userPosts.filter(post => post.status === 'active').length,
        pendingPosts: userPosts.filter(post => post.status === 'pending').length,
        expiredPosts: userPosts.filter(post => post.status === 'expired').length,
        
        totalRequests: rentalRequests.length,
        pendingRequests: rentalRequests.filter(req => req.status === 'pending').length,
        acceptedRequests: rentalRequests.filter(req => req.status === 'accepted').length,
        rejectedRequests: rentalRequests.filter(req => req.status === 'rejected').length,
        
        // Today's metrics
        todayViews: todayAnalytics.reduce((sum, analytics) => sum + analytics.metrics.views, 0),
        todayMessages: todayAnalytics.reduce((sum, analytics) => sum + analytics.metrics.messages, 0),
        todayCalls: todayAnalytics.reduce((sum, analytics) => sum + analytics.metrics.calls, 0),
        todayRevenue: todayAnalytics.reduce((sum, analytics) => sum + analytics.revenue, 0),
      };

      // Calculate changes (mock for now - would need historical data)
      const changes = {
        postsChange: '+2',
        requestsChange: '+3',
        viewsChange: '+12%',
        revenueChange: '+18%',
      };

      return {
        stats,
        changes,
        recentPosts: userPosts.slice(0, 3),
        recentRequests: rentalRequests
          .filter(req => req.status === 'pending')
          .slice(0, 3)
      };
    } catch (error) {
      throw new Error(`Error getting dashboard overview: ${error.message}`);
    }
  }

  // Get landlord's posts with filters
  async getLandlordPosts({ userId, page, limit, filters, search }) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      let query = { ...filters };
      
      // Add search functionality
      if (search) {
        // First get rooms that match search criteria
        const matchingRooms = await Room.find({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        const roomIds = matchingRooms.map(room => room._id);
        query.roomId = { $in: roomIds };
      }

      // Get posts with pagination
      const posts = await Post.find(query)
        .populate({
          path: 'roomId',
          select: 'title description price area address city images amenities'
        })
        .populate({
          path: 'landlord',
          select: 'full_name email phone'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Post.countDocuments(query);

      // Get analytics for these posts
      const postIds = posts.map(post => post._id);
      const analytics = await PostAnalytics.aggregate([
        { $match: { post: { $in: postIds } } },
        {
          $group: {
            _id: '$post',
            totalViews: { $sum: '$metrics.views' },
            totalLikes: { $sum: '$metrics.likes' },
            totalCalls: { $sum: '$metrics.calls' },
            totalMessages: { $sum: '$metrics.messages' },
            totalRevenue: { $sum: '$revenue' },
          }
        }
      ]);

      // Merge analytics with posts
      const postsWithAnalytics = posts.map(post => {
        const postAnalytics = analytics.find(a => a._id.toString() === post._id.toString());
        return {
          ...post,
          analytics: {
            views: postAnalytics?.totalViews || 0,
            likes: postAnalytics?.totalLikes || 0,
            calls: postAnalytics?.totalCalls || 0,
            messages: postAnalytics?.totalMessages || 0,
            revenue: postAnalytics?.totalRevenue || 0,
          }
        };
      });

      return {
        posts: postsWithAnalytics,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      throw new Error(`Error getting landlord posts: ${error.message}`);
    }
  }

  // Update post status
  async updatePostStatus(postId, userId, status) {
    try {
      const post = await Post.findOne({ _id: postId, landlord: userId });
      if (!post) {
        throw new Error('Post not found or unauthorized');
      }

      post.status = status;
      if (status === 'active') {
        // Reset expiry date when reactivating
        post.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }

      await post.save();
      await post.populate('roomId');

      return post;
    } catch (error) {
      throw new Error(`Error updating post status: ${error.message}`);
    }
  }

  // Renew expired post
  async renewPost(postId, userId) {
    try {
      const post = await Post.findOne({ _id: postId, landlord: userId });
      if (!post) {
        throw new Error('Post not found or unauthorized');
      }

      // Update post with new expiry
      post.status = 'active';
      post.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      post.renewedAt = new Date();

      await post.save();
      await post.populate('roomId');

      return post;
    } catch (error) {
      throw new Error(`Error renewing post: ${error.message}`);
    }
  }

  // Get post analytics
  async getPostAnalytics(userId, timeRange, postId) {
    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Build query
      let query = {
        landlord: userId,
        date: { $gte: startDateStr, $lte: endDateStr }
      };

      if (postId && postId !== 'all') {
        query.post = postId;
      }

      // Get analytics data
      const analytics = await PostAnalytics.find(query)
        .populate('post')
        .sort({ date: -1 })
        .lean();

      // Aggregate data
      const summary = {
        totalViews: 0,
        totalLikes: 0,
        totalCalls: 0,
        totalMessages: 0,
        totalRevenue: 0,
        avgCTR: 0,
        topPerformingPosts: [],
        dailyStats: [],
        deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
        locationStats: [],
        demographics: {
          "18-25": 0,
          "26-35": 0,
          "36-45": 0,
          "45+": 0
        }
      };

      analytics.forEach(data => {
        summary.totalViews += data.metrics.views;
        summary.totalLikes += data.metrics.likes;
        summary.totalCalls += data.metrics.calls;
        summary.totalMessages += data.metrics.messages;

        // Device stats
        if (data.deviceStats) {
          summary.deviceStats.mobile += data.deviceStats.mobile || 0;
          summary.deviceStats.desktop += data.deviceStats.desktop || 0;
          summary.deviceStats.tablet += data.deviceStats.tablet || 0;
        }

        // Demographics
        if (data.ageStats) {
          Object.keys(data.ageStats).forEach(ageGroup => {
            if (summary.demographics[ageGroup] !== undefined) {
              summary.demographics[ageGroup] += data.ageStats[ageGroup] || 0;
            }
          });
        }

        // Location stats
        if (data.locationStats && data.locationStats.length > 0) {
          summary.locationStats = data.locationStats;
        }
      });

      // Calculate average CTR (simulate based on views/likes ratio)
      if (summary.totalViews > 0) {
        summary.avgCTR = ((summary.totalLikes / summary.totalViews) * 100).toFixed(2);
      }

      // Get top performing posts
      const postStats = {};
      analytics.forEach(data => {
        if (data.post && data.post._id) {
          const postId = data.post._id.toString();
          if (!postStats[postId]) {
            postStats[postId] = {
              _id: postId,
              id: postId,
              title: `Tin đăng ${postId.substring(0, 8)}...`,
              roomId: {
                _id: data.post.roomId || postId,
                title: `Phòng trọ ${postId.substring(0, 8)}...`,
                address: 'Địa chỉ mẫu',
                city: 'Hà Nội',
                price: Math.floor(Math.random() * 5000000) + 2000000,
                area: Math.floor(Math.random() * 30) + 20,
                images: ['/placeholder-room.svg']
              },
              views: 0,
              likes: 0,
              calls: 0,
              messages: 0,
              ctr: 0,
              analytics: {
                views: 0,
                likes: 0,
                calls: 0,
                messages: 0
              }
            };
          }
          postStats[postId].views += data.metrics.views;
          postStats[postId].likes += data.metrics.likes;
          postStats[postId].calls += data.metrics.calls;
          postStats[postId].messages += data.metrics.messages;
          postStats[postId].analytics.views += data.metrics.views;
          postStats[postId].analytics.likes += data.metrics.likes;
          postStats[postId].analytics.calls += data.metrics.calls;
          postStats[postId].analytics.messages += data.metrics.messages;
        }
      });

      // Calculate CTR for each post and sort by views
      Object.values(postStats).forEach(post => {
        post.ctr = post.views > 0 ? ((post.likes / post.views) * 100).toFixed(1) : 0;
      });

      summary.topPerformingPosts = Object.values(postStats)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Create daily stats
      const dailyStats = {};
      analytics.forEach(data => {
        if (!dailyStats[data.date]) {
          dailyStats[data.date] = {
            date: data.date,
            views: 0,
            likes: 0,
            calls: 0,
            messages: 0
          };
        }
        dailyStats[data.date].views += data.metrics.views;
        dailyStats[data.date].likes += data.metrics.likes;
        dailyStats[data.date].calls += data.metrics.calls;
        dailyStats[data.date].messages += data.metrics.messages;
      });

      summary.dailyStats = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));

      // Create time analytics
      summary.timeAnalytics = {
        bestDays: summary.dailyStats.slice(-7).map(day => ({
          day: new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
          views: day.views
        })),
        bestHours: [
          { hour: '9:00', views: Math.floor(summary.totalViews * 0.15) },
          { hour: '12:00', views: Math.floor(summary.totalViews * 0.12) },
          { hour: '18:00', views: Math.floor(summary.totalViews * 0.25) },
          { hour: '21:00', views: Math.floor(summary.totalViews * 0.20) }
        ]
      };

      // Add overview changes (simulate)
      summary.overview = {
        totalViews: summary.totalViews,
        totalLikes: summary.totalLikes,
        totalCalls: summary.totalCalls,
        totalMessages: summary.totalMessages,
        viewsChange: '+12%',
        likesChange: '-2%',
        callsChange: '+8%',
        messagesChange: '+25%'
      };

      // Add demographics with proper structure
      summary.demographics = {
        ageGroups: [
          { range: '18-25', percentage: Math.round((summary.demographics['18-25'] / (summary.demographics['18-25'] + summary.demographics['26-35'] + summary.demographics['36-45'] + summary.demographics['45+'])) * 100), label: 'Sinh viên' },
          { range: '26-35', percentage: Math.round((summary.demographics['26-35'] / (summary.demographics['18-25'] + summary.demographics['26-35'] + summary.demographics['36-45'] + summary.demographics['45+'])) * 100), label: 'Nhân viên trẻ' },
          { range: '36-45', percentage: Math.round((summary.demographics['36-45'] / (summary.demographics['18-25'] + summary.demographics['26-35'] + summary.demographics['36-45'] + summary.demographics['45+'])) * 100), label: 'Gia đình trẻ' },
          { range: '45+', percentage: Math.round((summary.demographics['45+'] / (summary.demographics['18-25'] + summary.demographics['26-35'] + summary.demographics['36-45'] + summary.demographics['45+'])) * 100), label: 'Khác' }
        ],
        devices: [
          { type: 'Mobile', percentage: Math.round((summary.deviceStats.mobile / (summary.deviceStats.mobile + summary.deviceStats.desktop + summary.deviceStats.tablet)) * 100), icon: 'DevicePhoneMobileIcon' },
          { type: 'Desktop', percentage: Math.round((summary.deviceStats.desktop / (summary.deviceStats.mobile + summary.deviceStats.desktop + summary.deviceStats.tablet)) * 100), icon: 'ComputerDesktopIcon' },
          { type: 'Tablet', percentage: Math.round((summary.deviceStats.tablet / (summary.deviceStats.mobile + summary.deviceStats.desktop + summary.deviceStats.tablet)) * 100), icon: 'GlobeAltIcon' }
        ],
        locations: summary.locationStats || []
      };

      return summary;
    } catch (error) {
      throw new Error(`Error getting post analytics: ${error.message}`);
    }
  }

  // Get recent activities
  async getRecentActivities(userId, limit) {
    try {
      // Get recent rental requests
      const recentRequests = await RentalRequest.find({ landlord: userId })
        .populate('tenant', 'full_name email')
        .populate('post')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Get recent posts
      const recentPosts = await Post.find({ landlord: userId })
        .populate('roomId', 'title')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Combine and format activities
      const activities = [];

      recentRequests.forEach(request => {
        activities.push({
          id: request._id,
          type: 'request',
          message: `Có yêu cầu thuê mới từ ${request.tenant.full_name}`,
          time: request.createdAt,
          metadata: {
            tenantName: request.tenant.full_name,
            postTitle: request.post?.roomId?.title || 'Tin đăng',
            status: request.status
          }
        });
      });

      recentPosts.forEach(post => {
        activities.push({
          id: post._id,
          type: 'post',
          message: `Đã đăng tin "${post.roomId?.title || 'Tin đăng mới'}"`,
          time: post.createdAt,
          metadata: {
            postTitle: post.roomId?.title,
            status: post.status
          }
        });
      });

      // Sort by time and limit
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      return activities.slice(0, limit);

    } catch (error) {
      throw new Error(`Error getting recent activities: ${error.message}`);
    }
  }

  // Get single post by ID
  async getPostById(postId, userId) {
    try {
      const post = await Post.findOne({ _id: postId, landlord: userId })
        .populate('roomId')
        .lean();

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error) {
      throw new Error(`Error getting post: ${error.message}`);
    }
  }

  // Create new post
  async createPost(userId, postData) {
    try {
      // First create the room
      const roomData = {
        ...postData.room,
        landlord: userId
      };
      const room = new Room(roomData);
      await room.save();

      // Then create the post
      const newPostData = {
        roomId: room._id,
        landlord: userId,
        options: postData.options || [],
        favouriteLevel: postData.favouriteLevel || 'free',
        status: postData.status || 'pending'
      };
      const post = new Post(newPostData);
      await post.save();

      // Populate and return
      const populatedPost = await Post.findById(post._id)
        .populate('roomId')
        .lean();

      return populatedPost;
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }
  }

  // Update existing post
  async updatePost(postId, userId, updateData) {
    try {
      const post = await Post.findOne({ _id: postId, landlord: userId });
      if (!post) {
        throw new Error('Post not found');
      }

      // Update room data if provided
      if (updateData.room) {
        await Room.findByIdAndUpdate(post.roomId, updateData.room);
      }

      // Update post data
      const allowedFields = ['options', 'favouriteLevel', 'status'];
      const postUpdate = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          postUpdate[field] = updateData[field];
        }
      });

      if (Object.keys(postUpdate).length > 0) {
        await Post.findByIdAndUpdate(postId, postUpdate);
      }

      // Return updated post
      const updatedPost = await Post.findById(postId)
        .populate('roomId')
        .lean();

      return updatedPost;
    } catch (error) {
      throw new Error(`Error updating post: ${error.message}`);
    }
  }

  // Delete post
  async deletePost(postId, userId) {
    try {
      const post = await Post.findOne({ _id: postId, landlord: userId });
      if (!post) {
        throw new Error('Post not found');
      }

      // Delete associated room
      await Room.findByIdAndDelete(post.roomId);
      
      // Delete post
      await Post.findByIdAndDelete(postId);

      // Delete related rental requests
      await RentalRequest.deleteMany({ post: postId });

      return { message: 'Post deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  }
}

export default new DashboardService();
