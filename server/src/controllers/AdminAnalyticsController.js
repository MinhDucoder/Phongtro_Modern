import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import catchAsync from "../middlewares/catchAsync.js";

class AdminAnalyticsController {
  // Lấy tổng quan analytics
  getAnalytics = catchAsync(async (req, res) => {
    const { range = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get overview statistics
    const [
      totalUsers,
      totalPosts,
      totalRooms,
      usersInRange,
      postsInRange
    ] = await Promise.all([
      User.countDocuments({ is_deleted: { $ne: true } }),
      Post.countDocuments(),
      Room.countDocuments(),
      User.countDocuments({ 
        created_at: { $gte: startDate },
        is_deleted: { $ne: true }
      }),
      Post.countDocuments({ 
        createdAt: { $gte: startDate }
      })
    ]);

    // Calculate growth rates (comparing with previous period)
    const previousPeriodStart = new Date(startDate);
    const periodDuration = now.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodDuration);

    const [
      previousUsers,
      previousPosts
    ] = await Promise.all([
      User.countDocuments({ 
        created_at: { $gte: previousPeriodStart, $lt: startDate },
        is_deleted: { $ne: true }
      }),
      Post.countDocuments({ 
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      })
    ]);

    const usersGrowth = previousUsers > 0 
      ? ((usersInRange - previousUsers) / previousUsers) * 100 
      : 100;
    const postsGrowth = previousPosts > 0 
      ? ((postsInRange - previousPosts) / previousPosts) * 100 
      : 100;

    // Posts by status
    const postsByStatus = await Post.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      active: 0,
      pending: 0,
      expired: 0,
      rejected: 0
    };

    postsByStatus.forEach(item => {
      if (item._id in statusMap) {
        statusMap[item._id] = item.count;
      }
    });

    // Get posts by category (based on room type)
    const postsByCategory = await Post.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: {
          path: '$room',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$room.property_type",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: { $ifNull: ["$_id", "Khác"] },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Top cities
    const topCities = await Room.aggregate([
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
          totalPrice: { $sum: "$price" }
        }
      },
      {
        $project: {
          city: { $ifNull: ["$_id", "Không xác định"] },
          count: 1,
          revenue: "$totalPrice",
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const revenueByMonth = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          posts: { $sum: 1 },
          revenue: { $sum: 1000000 } // Mock revenue - replace with actual revenue field
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              "Tháng ",
              { $toString: "$_id.month" }
            ]
          },
          revenue: 1,
          posts: 1,
          _id: 0
        }
      }
    ]);

    // Top landlords
    const topLandlords = await Post.aggregate([
      {
        $match: {
          status: "active"
        }
      },
      {
        $group: {
          _id: "$landlord",
          totalPosts: { $sum: 1 },
          totalRevenue: { $sum: 1000000 } // Mock revenue
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'landlordInfo'
        }
      },
      {
        $unwind: "$landlordInfo"
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: "$landlordInfo.full_name",
          totalPosts: 1,
          totalRevenue: 1
          // averageRating will be added when review system is implemented
        }
      },
      {
        $sort: { totalPosts: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // User activity (last 7 days)
    const userActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const [newUsers, activeUsers] = await Promise.all([
        User.countDocuments({
          created_at: { $gte: date, $lt: nextDate },
          is_deleted: { $ne: true }
        }),
        User.countDocuments({
          last_login: { $gte: date, $lt: nextDate }
        })
      ]);

      userActivity.push({
        date: date.toISOString().split('T')[0],
        newUsers,
        activeUsers
      });
    }

    // Calculate total revenue (mock - replace with actual calculation)
    const totalRevenue = totalPosts * 1000000; // Assuming 1M VND per post
    const totalViews = totalPosts * 150; // Mock views

    const analyticsData = {
      overview: {
        totalRevenue,
        totalViews,
        totalPosts,
        totalUsers,
        // averageRating will be added when review system is implemented
        conversionRate: 3.2
      },
      growth: {
        revenueGrowth: postsGrowth, // Using posts growth as proxy
        viewsGrowth: postsGrowth * 0.7,
        postsGrowth,
        usersGrowth
      },
      postsByStatus: statusMap,
      postsByCategory,
      topCities,
      revenueByMonth,
      topLandlords,
      userActivity
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  });

  // Get detailed analytics for a specific metric
  getDetailedAnalytics = catchAsync(async (req, res) => {
    const { metric, range = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    let data;

    switch (metric) {
      case 'users':
        data = await User.aggregate([
          {
            $match: {
              created_at: { $gte: startDate },
              is_deleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" },
                day: { $dayOfMonth: "$created_at" }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
          }
        ]);
        break;

      case 'posts':
        data = await Post.aggregate([
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
              count: { $sum: 1 }
            }
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
          }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid metric specified'
        });
    }

    res.status(200).json({
      success: true,
      data
    });
  });
}

export default new AdminAnalyticsController();
