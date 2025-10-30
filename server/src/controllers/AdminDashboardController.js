// @ts-nocheck
import User from '../models/userSchema.js';
import Post from '../models/postSchema.js';
import Room from '../models/roomSchema.js';
import RentalRequest from '../models/rentalRequestSchema.js';
import catchAsync from '../middlewares/catchAsync.js';
import { getOrSetCache, deleteCacheByPrefix } from '../services/redisService.js';

export const getDashboardOverview = catchAsync(async (req, res) => {
  // 🔹 Cache dashboard data với TTL 2 phút (real-time dashboard)
  const cacheKey = 'admin:dashboard:overview';
  
  const dashboardData = await getOrSetCache(
    cacheKey,
    async () => {
      // Get basic counts
      const [
        totalUsers,
        totalLandlords,
        totalTenants,
        totalRooms,
        totalPosts,
        activePosts,
        pendingPosts,
        rejectedPosts,
        expiredPosts,
        totalRequests,
        pendingRequests,
        acceptedRequests
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'landlord' }),
        User.countDocuments({ role: 'user' }),
        Room.countDocuments(),
        Post.countDocuments(),
        Post.countDocuments({ status: 'active' }),
        Post.countDocuments({ status: 'pending' }),
        Post.countDocuments({ status: 'rejected' }),
        Post.countDocuments({ status: 'expired' }),
        RentalRequest.countDocuments(),
        RentalRequest.countDocuments({ status: 'pending' }),
        RentalRequest.countDocuments({ status: 'accepted' })
      ]);

      // Get analytics data
      const postsWithAnalytics = await Post.find({}, 'analytics').lean();
      const totalViews = postsWithAnalytics.reduce((sum, post) => sum + (post.analytics?.views || 0), 0);
      const totalLikes = postsWithAnalytics.reduce((sum, post) => sum + (post.analytics?.likes || 0), 0);

      // Get this month's data
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [newUsersThisMonth, newPostsThisMonth] = await Promise.all([
        User.countDocuments({ created_at: { $gte: startOfMonth } }),
        Post.countDocuments({ createdAt: { $gte: startOfMonth } })
      ]);

      // Get recent users (5 newest, sorted by registration time, exclude admin)
      const recentUsers = await User.find({ role: { $ne: 'admin' } }, 'full_name email role created_at')
        .sort({ created_at: -1 })
        .limit(5)
        .lean();

      // Get recent posts
      const recentPosts = await Post.find({ status: 'pending' })
        .populate('roomId', 'title')
        .populate('landlord', 'full_name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      // Get top performing posts
      const topPosts = await Post.find({ status: 'active' })
        .populate('roomId', 'title')
        .sort({ 'analytics.views': -1 })
        .limit(5)
        .lean();

      // Calculate growth rates (mock for now)
      const userGrowthRate = '+12.5%';
      const postGrowthRate = '+8.3%';
      const revenueGrowthRate = '+15.2%';

      const overview = {
        totalUsers,
        totalLandlords,
        totalTenants,
        totalRooms,
        totalPosts,
        activePosts,
        pendingPosts,
        rejectedPosts,
        expiredPosts,
        totalRequests,
        pendingRequests,
        acceptedRequests,
        totalViews,
        totalLikes,
        totalRevenue: 45000000, // Mock revenue
        newUsersThisMonth,
        newPostsThisMonth
      };

      const growth = {
        userGrowthRate,
        postGrowthRate,
        revenueGrowthRate
      };

      const recent = {
        users: recentUsers.map(user => ({
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
        })),
        posts: recentPosts.map(post => ({
          _id: post._id,
          roomTitle: post.roomId?.title,
          landlordName: post.landlord?.full_name,
          status: post.status,
          createdAt: post.createdAt || post.created_at || new Date().toISOString()
        })),
        topPosts: topPosts.map(post => ({
          _id: post._id,
          title: post.roomId?.title || 'Không có tiêu đề',
          views: post.analytics?.views || 0,
          likes: post.analytics?.likes || 0
        }))
      };

      return {
        overview,
        growth,
        recent
      };
    },
    120 // TTL 2 phút cho dashboard (cần gần real-time)
  );

  res.json({
    success: true,
    data: dashboardData
  });
});
