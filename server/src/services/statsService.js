// services/statsService.js
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import mongoose from "mongoose";

class StatsService {
  // Lấy tổng quan thống kê
  async getOverviewStats() {
    try {
      const [
        totalPosts,
        totalUsers,
        totalRooms,
        activePosts,
        newPostsToday,
        totalViews
      ] = await Promise.all([
        Post.countDocuments(),
        User.countDocuments(),
        Room.countDocuments(),
        Post.countDocuments({ status: 'active' }),
        Post.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        this.getTotalViews()
      ]);

      return {
        totalPosts,
        totalUsers,
        totalRooms,
        activePosts,
        newPostsToday,
        totalViews,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Error getting overview stats: ${error.message}`);
    }
  }

  // Lấy thống kê real-time
  async getRealTimeStats() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        onlineUsers,
        postsLastHour,
        postsLastDay,
        viewsLastHour,
        viewsLastDay
      ] = await Promise.all([
        User.countDocuments({ last_login: { $gte: oneHourAgo } }),
        Post.countDocuments({ createdAt: { $gte: oneHourAgo } }),
        Post.countDocuments({ createdAt: { $gte: oneDayAgo } }),
        this.getViewsInPeriod(oneHourAgo),
        this.getViewsInPeriod(oneDayAgo)
      ]);

      return {
        onlineUsers,
        postsLastHour,
        postsLastDay,
        viewsLastHour,
        viewsLastDay,
        timestamp: now
      };
    } catch (error) {
      throw new Error(`Error getting real-time stats: ${error.message}`);
    }
  }

  // Lấy xu hướng thống kê
  async getTrendingStats(period = '7d', limit = 10) {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 7;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Convert limit to number
      const limitNum = parseInt(limit, 10) || 10;

      // Xu hướng theo thành phố
      const cityTrends = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'active'
          }
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
          }
        },
        {
          $unwind: '$room'
        },
        {
          $group: {
            _id: '$room.city',
            count: { $sum: 1 },
            avgPrice: { $avg: '$room.price' },
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limitNum
        }
      ]);

      // Xu hướng theo loại phòng
      const propertyTypeTrends = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$propertyType',
            count: { $sum: 1 },
            avgPrice: { $avg: '$roomId.price' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return {
        cityTrends,
        propertyTypeTrends,
        period,
        startDate,
        endDate: new Date()
      };
    } catch (error) {
      throw new Error(`Error getting trending stats: ${error.message}`);
    }
  }

  // Lấy thống kê theo thành phố
  async getCityStats() {
    try {
      const cityStats = await Post.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
          }
        },
        {
          $unwind: '$room'
        },
        {
          $group: {
            _id: '$room.city',
            totalPosts: { $sum: 1 },
            avgPrice: { $avg: '$room.price' },
            minPrice: { $min: '$room.price' },
            maxPrice: { $max: '$room.price' },
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } }
          }
        },
        {
          $sort: { totalPosts: -1 }
        }
      ]);

      return cityStats;
    } catch (error) {
      throw new Error(`Error getting city stats: ${error.message}`);
    }
  }

  // Lấy thống kê theo loại phòng
  async getPropertyTypeStats() {
    try {
      const propertyStats = await Post.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: '$propertyType',
            totalPosts: { $sum: 1 },
            avgPrice: { $avg: '$roomId.price' },
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } }
          }
        },
        {
          $sort: { totalPosts: -1 }
        }
      ]);

      return propertyStats;
    } catch (error) {
      throw new Error(`Error getting property type stats: ${error.message}`);
    }
  }

  // Lấy thống kê giá thuê
  async getPriceStats(city = null, propertyType = null) {
    try {
      const matchStage = { status: 'active' };
      if (city) matchStage['roomId.city'] = city;
      if (propertyType) matchStage.propertyType = propertyType;

      const priceStats = await Post.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
          }
        },
        {
          $unwind: '$room'
        },
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$room.price' },
            minPrice: { $min: '$room.price' },
            maxPrice: { $max: '$room.price' },
            medianPrice: { $percentile: { input: '$room.price', p: [0.5] } },
            priceRanges: {
              $push: {
                $cond: [
                  { $lt: ['$room.price', 1000000] },
                  'under_1m',
                  {
                    $cond: [
                      { $lt: ['$room.price', 3000000] },
                      '1m_to_3m',
                      {
                        $cond: [
                          { $lt: ['$room.price', 5000000] },
                          '3m_to_5m',
                          'over_5m'
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      ]);

      return priceStats[0] || {};
    } catch (error) {
      throw new Error(`Error getting price stats: ${error.message}`);
    }
  }

  // Lấy thống kê người dùng
  async getUserStats() {
    try {
      const userStats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            verifiedUsers: {
              $sum: { $cond: ['$is_verified', 1, 0] }
            }
          }
        }
      ]);

      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ is_verified: true });
      const newUsersToday = await User.countDocuments({
        created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        totalUsers,
        verifiedUsers,
        newUsersToday,
        byRole: userStats,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
      };
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  // Helper methods
  async getTotalViews() {
    try {
      const result = await Post.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } }
          }
        }
      ]);
      return result[0]?.totalViews || 0;
    } catch (error) {
      return 0;
    }
  }

  async getViewsInPeriod(startDate) {
    try {
      const result = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } }
          }
        }
      ]);
      return result[0]?.totalViews || 0;
    } catch (error) {
      return 0;
    }
  }
}

export default new StatsService();
