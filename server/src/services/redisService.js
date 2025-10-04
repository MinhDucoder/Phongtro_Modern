import redis from "~/config/redis.config.mjs";
import postService from "./postService";

function buildCacheKey({ filers = {}, page = 1, limit = 10, sort = {} }) {
  const filterKey =
    Object.entries(filers)
      .map(([key, value]) => `${key}:${value}`)
      .join("|") || "nofilter";
  const sortKey =
    Object.entries(sort)
      .map(([key, value]) => `${key}:${value}`)
      .join("|") || "nosort";
  return `posts:${filterKey}:sort:${sortKey}:page:${page}:limit:${limit}`;
}

export async function clearPostCache() {
  try {
    const pattern = "posts:*";
    let cursor = 0;

    do {
      const reply = await redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
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
    console.error("Lỗi clearPostsCache:", error);
    throw new Error(`Lỗi khi xóa cache: ${error.message}`);
  }
}

export async function buildCacheForPopularQueries() {
  try {
    const [hnPosts, dnPosts, hcmPosts, priceAsc, priceDesc] = await Promise.all(
      [
        postService.getPosts({
          filers: { roomId: "Hà Nội" },
          page: 1,
          limit: 10,
        }),
        postService.getPosts({
          filers: { roomId: "Đà Nẵng" },
          page: 1,
          limit: 10,
        }),
        postService.getPosts({
          filers: { roomId: "Hồ Chí Minh" },
          page: 1,
          limit: 10,
        }),
        postService.getPosts({ sort: { price: 1 }, page: 1, limit: 10 }),
        postService.getPosts({ sort: { price: -1 }, page: 1, limit: 10 }),
      ]
    );

    const pipeline = redis.multi();
    pipeline.setEx(
      buildCacheKey({
        filters: { roomId: "Hà Nội" },
        page: 1,
        limit: 10,
        sort: { createAt: -1 },
      }),
      3600,
      JSON.stringify(hnPosts)
    );
    pipeline.setEx(
      buildCacheKey({
        filters: { roomId: "Hồ Chí Minh" },
        page: 1,
        limit: 10,
        sort: { createAt: -1 },
      }),
      3600,
      JSON.stringify(hcmPosts)
    );
    pipeline.setEx(
      buildCacheKey({
        filters: { roomId: "Đã Nẵng" },
        page: 1,
        limit: 10,
        sort: { createAt: -1 },
      }),
      3600,
      JSON.stringify(dnPosts)
    );
    pipeline.setEx(
      buildCacheKey({
        page: 1,
        limit: 10,
        sort: { price: 1 },
      }),
      3600,
      JSON.stringify(priceAsc)
    );
    pipeline.setEx(
      buildCacheKey({
        page: 1,
        limit: 10,
        sort: { price: -1 },
      }),
      3600,
      JSON.stringify(priceDesc)
    );

    await pipeline.exec();
    console.log("✅ Đã tạo cache cho các truy vấn phổ biến");
  } catch (error) {
    console.error("Lỗi buildCacheForPopularQueries:", error);
    throw new Error(`Lỗi khi tạo cache: ${error.message}`);
  }
}

export async function getOrSetCache(keyParams, fetchFn, ttl = 600) {
  const key = buildCacheKey(keyParams);
  const cached = await redis.get(key);

  if (cached) {
    console.log("Cache hit for key:", key);
    return JSON.parse(cached);
  }

  console.log("Cache miss for key:", key);
    const data = await fetchFn();
    await redis.setEx(key, ttl, JSON.stringify(data));
    return data;
}
