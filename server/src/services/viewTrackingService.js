import crypto from "crypto";
import Post from "../models/postSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";

// Đơn giản: cache trong bộ nhớ với TTL theo ngày
const inMemoryCache = new Map();

function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"]; 
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "0.0.0.0";
}

function getToday() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function makeDailyKey({ ip, ua, postId, date }) {
  const raw = `${ip}|${ua}|${postId}|${date}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function setCacheWithExpiry(key, ttlMs) {
  const expireAt = Date.now() + ttlMs;
  inMemoryCache.set(key, expireAt);
}

function hasValidCache(key) {
  const expireAt = inMemoryCache.get(key);
  if (!expireAt) return false;
  if (Date.now() > expireAt) {
    inMemoryCache.delete(key);
    return false;
  }
  return true;
}

export async function incrementPostView(req, postId) {
  const ua = req.headers["user-agent"] || "";
  const ip = getClientIp(req);
  const date = getToday();

  const dailyKey = makeDailyKey({ ip, ua, postId, date });
  const isUniqueToday = !hasValidCache(dailyKey);

  // TTL đến cuối ngày UTC
  const now = new Date();
  const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const ttlMs = tomorrowUtc.getTime() - now.getTime();
  if (isUniqueToday) setCacheWithExpiry(dailyKey, ttlMs);

  // Cập nhật tổng trên Post
  const inc = { "views.total": 1 };
  if (isUniqueToday) inc["visits.total"] = 1;
  await Post.updateOne({ _id: postId }, { $inc: inc, $set: { lastViewedAt: new Date() } }).exec();

  // Ghi vào timeseries theo ngày
  await PostAnalytics.updateOne(
    { post: postId, landlord: req.user?._id || req.user?.id || null, date },
    {
      $setOnInsert: { hourlyViews: [], deviceStats: { mobile: 0, desktop: 0, tablet: 0 } },
      $inc: { "metrics.views": 1, ...(isUniqueToday ? { "metrics.uniqueViews": 1 } : {}) },
    },
    { upsert: true }
  ).exec();

  return { isUniqueToday };
}

export default {
  incrementPostView,
};





