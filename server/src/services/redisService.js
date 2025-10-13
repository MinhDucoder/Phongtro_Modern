import redis from "~/config/redis.config.mjs";
import postService from "./postService.js";

/**
 * Tạo cache key từ filters, sort, page, limit
 */
function buildCacheKey({ filters = {}, page = 1, limit = 10, sort = {} }) {
  const filterKey =
    Object.entries(filters)
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join("|") || "nofilter";

  const sortKey =
    Object.entries(sort)
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join("|") || "nosort";

  return `posts:${filterKey}:sort:${sortKey}:page:${page}:limit:${limit}`;
}

/**
 * Lấy cache theo key
 */
export async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err);
    return null;
  }
}

/**
 * Lưu cache với TTL
 */
export async function setCache(key, value, ttl = 3600) {
  try {
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis SET error:", err);
  }
}

/**
 * Xóa cache theo key
 */
export async function delCache(key) {
  try {
    await redis.del(key);
    console.log(`🗑️ Đã xóa cache key: ${key}`);
  } catch (err) {
    console.error("Redis DEL error:", err);
  }
}

/**
 * Xóa cache theo pattern (dùng SCAN tránh block Redis)
 */
export async function clearCacheByPattern(pattern) {
  try {
    let cursor = 0;
    do {
      const reply = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = parseInt(reply.cursor);
      const keys = reply.keys;

      if (keys.length > 0) {
        const pipeline = redis.multi();
        keys.forEach((k) => pipeline.del(k));
        await pipeline.exec();
        console.log("🗑️ Đã xóa cache:", keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error("Lỗi clearCacheByPattern:", error);
    throw new Error(`Lỗi khi xóa cache: ${error.message}`);
  }
}

/**
 * Lấy cache nếu có, không thì fetch từ DB rồi set lại
 */
export async function getOrSetCache(keyParams, fetchFn, ttl = 600) {
  const key = buildCacheKey(keyParams);

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log("✅ Cache hit:", key);
      return JSON.parse(cached);
    }

    console.log("❌ Cache miss:", key);
    const data = await fetchFn();
    await redis.setEx(key, ttl, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("Redis getOrSetCache error:", err);
    // fallback → gọi DB trực tiếp
    return fetchFn();
  }
}

export async function getOrSetCacheSearch(keyParams, fetchFn, ttl = 600) {
  try {
    const cached = await redis.get(keyParams);
    if (cached) {
      console.log("✅ Cache hit:", keyParams);
      return JSON.parse(cached);
    }

    console.log("❌ Cache miss:", keyParams);
    const data = await fetchFn();
    await redis.setEx(keyParams, ttl, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("Redis getOrSetCache error:", err);
    // fallback → gọi DB trực tiếp
    return fetchFn();
  }
}

/**
 * Preload cache cho các query phổ biến
 */
export async function buildCacheForPopularQueries() {
  try {
    const [hnPosts, dnPosts, hcmPosts, priceAsc, priceDesc] = await Promise.all(
      [
        postService.listPosts({
          filters: { "roomId.city": "Hà Nội" },
          page: 1,
          limit: 10,
          sort: { createdAt: -1 },
        }),
        postService.listPosts({
          filters: { "roomId.city": "Đà Nẵng" },
          page: 1,
          limit: 10,
          sort: { createdAt: -1 },
        }),
        postService.listPosts({
          filters: { "roomId.city": "Hồ Chí Minh" },
          page: 1,
          limit: 10,
          sort: { createdAt: -1 },
        }),
        postService.listPosts({ sort: { price: 1 }, page: 1, limit: 10 }),
        postService.listPosts({ sort: { price: -1 }, page: 1, limit: 10 }),
      ]
    );

    const cacheItems = [
      { filters: { "roomId.city": "Hà Nội" }, sort: { createdAt: -1 }, data: hnPosts },
      { filters: { "roomId.city": "Đà Nẵng" }, sort: { createdAt: -1 }, data: dnPosts },
      { filters: { "roomId.city": "Hồ Chí Minh" }, sort: { createdAt: -1 }, data: hcmPosts },
      { sort: { price: 1 }, data: priceAsc },
      { sort: { price: -1 }, data: priceDesc },
    ];

    const pipeline = redis.multi();
    cacheItems.forEach(({ filters = {}, sort = {}, data }) => {
      const key = buildCacheKey({ filters, sort, page: 1, limit: 10 });
      pipeline.setEx(key, 3600, JSON.stringify(data));
    });

    await pipeline.exec();
    console.log("✅ Đã preload cache cho các query phổ biến");
  } catch (error) {
    console.error("Lỗi buildCacheForPopularQueries:", error);
    throw new Error(`Lỗi khi tạo cache: ${error.message}`);
  }
}

export { buildCacheKey };
