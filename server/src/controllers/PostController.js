// src/controllers/postController.js
import { getOrSetCache, clearCacheByPattern } from "~/services/redisService.js";
import postService from "~/services/postService.js";
import { success, error } from "~/utils/responeHandler.js";

class PostController {
  async create(req, res, _next) {
    try {
      const post = await postService.createPost(req.user.id, req.body);

      // ❌ Khi thêm post mới thì xóa cache cũ liên quan
      await clearCacheByPattern("posts:*");

      return success(res, post, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async list(req, res, _next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // 🧠 Build filters
      const filters = {
        status: req.query.status || "active",
      };

      if (req.query.city) filters.city = req.query.city;
      if (req.query.price_min) filters.price_min = Number(req.query.price_min);
      if (req.query.price_max) filters.price_max = Number(req.query.price_max);

      // ⚙️ Build sort
      const sort = req.query.sortBy
        ? { [req.query.sortBy]: req.query.order === "asc" ? 1 : -1 }
        : { createdAt: -1 };

      // 🔹 Redis cache: tránh lặp query DB
      const result = await getOrSetCache(
        { filters, page, limit, sort },
        () => postService.listPosts({ page, limit, filters, sort }),
        3600 // TTL 1h
      );

      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async detail(req, res, _next) {
    try {
      const post = await postService.getPostById(req.params.id);
      return success(res, post);
    } catch (err) {
      return error(res, err.message, 404);
    }
  }

  async update(req, res, _next) {
    try {
      const post = await postService.updatePost(
        req.params.id,
        req.user.id,
        req.body
      );

      // ❌ Khi update post → invalidate cache cũ
      await clearCacheByPattern("posts:*");

      return success(res, post);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async remove(req, res, _next) {
    try {
      await postService.deletePost(req.params.id, req.user.id);

      // ❌ Khi xóa post → clear cache cũ
      await clearCacheByPattern("posts:*");

      return success(res, null, 204);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new PostController();
