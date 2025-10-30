import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { success, error } from "../utils/responeHandler.js";

function dateNDaysAgoUtc(n) {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - n);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

class LandlordStatsController {
  async overview(req, res) {
    try {
      const landlordId = req.user.id || req.user._id;

      const [activePosts, availableRooms] = await Promise.all([
        Post.countDocuments({ landlord: landlordId, status: "active" }),
        Room.countDocuments({ landlord: landlordId, isAvailable: true }),
      ]);

      const since7 = dateNDaysAgoUtc(6); // include today
      const since30 = dateNDaysAgoUtc(29);

      const [agg7, agg30] = await Promise.all([
        PostAnalytics.aggregate([
          { $match: { landlord: PostAnalytics.db.cast(landlordId), date: { $gte: since7 } } },
          { $group: { _id: null, views: { $sum: "$metrics.views" }, uniqueViews: { $sum: "$metrics.uniqueViews" } } },
        ]),
        PostAnalytics.aggregate([
          { $match: { landlord: PostAnalytics.db.cast(landlordId), date: { $gte: since30 } } },
          { $group: { _id: null, views: { $sum: "$metrics.views" }, uniqueViews: { $sum: "$metrics.uniqueViews" } } },
        ]),
      ]);

      return success(res, {
        activePosts,
        availableRooms,
        last7Days: {
          views: agg7[0]?.views || 0,
          uniqueViews: agg7[0]?.uniqueViews || 0,
        },
        last30Days: {
          views: agg30[0]?.views || 0,
          uniqueViews: agg30[0]?.uniqueViews || 0,
        },
      });
    } catch (e) {
      return error(res, e.message, 400);
    }
  }

  async posts(req, res) {
    try {
      const landlordId = req.user.id || req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Post.find({ landlord: landlordId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select({
            _id: 1,
            status: 1,
            favouriteLevel: 1,
            createdAt: 1,
            "views.total": 1,
            "visits.total": 1,
          })
          .lean(),
        Post.countDocuments({ landlord: landlordId }),
      ]);

      return success(res, { items, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (e) {
      return error(res, e.message, 400);
    }
  }

  async postTimeseries(req, res) {
    try {
      const landlordId = req.user.id || req.user._id;
      const postId = req.params.id;
      const range = parseInt(req.query.range) || 7;
      const since = dateNDaysAgoUtc(range - 1);

      const items = await PostAnalytics.find({ landlord: landlordId, post: postId, date: { $gte: since } })
        .sort({ date: 1 })
        .select({ date: 1, "metrics.views": 1, "metrics.uniqueViews": 1 })
        .lean();

      return success(res, { items });
    } catch (e) {
      return error(res, e.message, 400);
    }
  }
}

export default new LandlordStatsController();





