// src/controllers/postController.js
import postService from "../services/postService.js";
import { success, error } from "../utils/responeHandler.js";
import redis from "../config/redis.config.mjs";

class PostController {
  async create(req, res, next) {
    try {
      const post = await postService.createPost(req.user.id, req.body);
      return success(res, post, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};
      const sort = {};

      // Ví dụ filter
      if (req.query.city) filters["roomId.city"] = req.query.city;
      if (req.query.status) filters.status = req.query.status;

      if (req.query.sortBy) {
        sort[req.query.sortBy] = req.query.order === "asc" ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }
      // Tạo một khóa duy nhất cho mỗi tập hợp tham số truy vấn
      const cacheKey = `posts:${page}:${limit}:${JSON.stringify(
        filters
      )}:${JSON.stringify(sort)}`;
      // Kiểm tra dữ liệu trong Redis trước
      const cachedData = await redis.get(cacheKey);

      if(cachedData) {
        console.log("Serving from cache");
        return success(res, JSON.parse(cachedData));
      }

      const result = await postService.listPosts({
        page,
        limit,
        filters,
        sort,
      });

      await redis.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache trong 1 giờ

      console.log("Serving from database");
      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async detail(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      return success(res, post);
    } catch (err) {
      return error(res, err.message, 404);
    }
  }

  async update(req, res, next) {
    try {
      const post = await postService.updatePost(
        req.params.id,
        req.user.id,
        req.body
      );
      return success(res, post);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async remove(req, res, next) {
    try {
      await postService.deletePost(req.params.id, req.user.id);
      return success(res, null, 204);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new PostController();
