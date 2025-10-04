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
      const filters = {};
      const sort = {};

      // Build filters
      if (req.query.city) filters["roomId.city"] = req.query.city;
      if (req.query.status) filters.status = req.query.status;

      // Build sort
      if (req.query.sortBy) {
        sort[req.query.sortBy] = req.query.order === "asc" ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      // 🔹 Sử dụng getOrSetCache thay vì tự get/set
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
