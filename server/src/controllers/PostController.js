// src/controllers/postController.js
import postService from "../services/postService.js";
import { success, error } from "../utils/responeHandler.js";

class PostController {
  async create(req, res, next) {
    try {
      console.log('=== POST CREATE REQUEST ===');
      console.log('User ID:', req.user?.id);
      console.log('Request Body:', req.body);
      
      const post = await postService.createPost(req.user.id, req.body);
      return success(res, post, 201);
    } catch (err) {
      console.error('=== POST CREATE ERROR ===');
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Xử lý lỗi đặc biệt cho subscription
      if (err.message.startsWith('SUBSCRIPTION_REQUIRED:')) {
        return error(res, err.message.replace('SUBSCRIPTION_REQUIRED:', ''), 403, {
          code: 'SUBSCRIPTION_REQUIRED',
          redirectTo: '/thanh-toan'
        });
      }
      
      if (err.message.startsWith('LIMIT_EXCEEDED:')) {
        return error(res, err.message.replace('LIMIT_EXCEEDED:', ''), 403, {
          code: 'LIMIT_EXCEEDED',
          redirectTo: '/thanh-toan'
        });
      }
      
      return error(res, err.message, 400);
    }
  }

  async getSubscriptionInfo(req, res, next) {
    try {
      const info = await postService.getUserSubscriptionInfo(req.user.id);
      return success(res, info);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {};
      const sort = {};

      // Mặc định chỉ lấy posts đã được duyệt (active) cho trang chủ
      filters.status = "active";

      // Ví dụ filter khác
      if (req.query.city) filters["roomId.city"] = req.query.city;

      if (req.query.sortBy) {
        sort[req.query.sortBy] = req.query.order === "asc" ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      const result = await postService.listPosts({ page, limit, filters, sort });
      
      // Thêm headers chống cache
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async listAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {};
      const sort = {};

      // Admin có thể filter theo status hoặc xem tất cả
      if (req.query.status) filters.status = req.query.status;

      // Ví dụ filter khác
      if (req.query.city) filters["roomId.city"] = req.query.city;

      if (req.query.sortBy) {
        sort[req.query.sortBy] = req.query.order === "asc" ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      const result = await postService.listPosts({ page, limit, filters, sort });
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
      const post = await postService.updatePost(req.params.id, req.user.id, req.body);
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
