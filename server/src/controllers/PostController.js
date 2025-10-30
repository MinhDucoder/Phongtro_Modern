// src/controllers/postController.js
import postService from "../services/postService.js";
import { searchPosts } from "../services/meiliSearchService.js";
import { success, error } from "../utils/responeHandler.js";
import viewTrackingService from "../services/viewTrackingService.js";

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
      const keyword = req.query.q?.trim();
      
      // Nếu có keyword → dùng MeiliSearch
      if (keyword && keyword.length > 0) {
        const filters = {};
        
        // Add filters cho MeiliSearch
        if (req.query.propertyType) {
          filters.type = req.query.propertyType;
        }
        if (req.query.province) {
          filters.province = req.query.province;
        }
        if (req.query.district) {
          filters.district = req.query.district;
        }
        
        const options = {
          page,
          limit,
          sortBy: req.query.sortBy || 'relevance',
          filters,
        };
        
        const meiliResults = await searchPosts(keyword, options);
        
        return success(res, {
          total: meiliResults.totalHits,
          items: meiliResults.hits,
          page: meiliResults.page,
          limit: meiliResults.limit,
          totalPages: meiliResults.totalPages,
        });
      }
      
      // Nếu không có keyword → dùng MongoDB như cũ
      const filters = {};
      const sort = {};

      // Mặc định chỉ lấy posts đã được duyệt (active) cho trang chủ
      filters.status = "active";

      // Filter theo propertyType
      if (req.query.propertyType) {
        filters["roomId.propertyType"] = req.query.propertyType;
      }
      
      // Filter theo province/city
      if (req.query.province) {
        filters["roomId.city"] = req.query.province;
      }
      
      // Filter theo district/huyện
      if (req.query.district) {
        filters["roomId.district"] = req.query.district;
      }

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
      // Ghi nhận view/visit (không chặn response nếu có lỗi nhỏ)
      try {
        await viewTrackingService.incrementPostView(req, req.params.id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("View tracking failed:", e?.message || e);
      }
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

  // Lấy 6 phòng trọ mới nhất được đăng (suggestions real-time)
  async suggestions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const filters = {};
      
      // Lấy từ MeiliSearch hoặc MongoDB
      // Nếu có keyword → dùng MeiliSearch
      const keyword = req.query.q?.trim();
      
      if (keyword && keyword.length > 0) {
        // Tìm kiếm real-time với keyword và sắp xếp theo mới nhất
        const options = {
          page: 1,
          limit,
          sortBy: 'createdAt:desc',
          filters: {},
        };
        
        const meiliResults = await searchPosts(keyword, options);
        
        return success(res, {
          items: meiliResults.hits,
          total: meiliResults.totalHits,
          limit,
        });
      }
      
      // Nếu không có keyword → lấy phòng trọ mới nhất
      filters.status = "active";
      
      // Filter theo propertyType nếu có
      if (req.query.propertyType) {
        filters["roomId.propertyType"] = req.query.propertyType;
      }
      
      // Filter theo province nếu có
      if (req.query.province) {
        filters["roomId.city"] = req.query.province;
      }
      
      // Filter theo district nếu có
      if (req.query.district) {
        filters["roomId.district"] = req.query.district;
      }
      
      const sort = { createdAt: -1 };
      const result = await postService.listPosts({ page: 1, limit, filters, sort });
      
      return success(res, {
        items: result.items,
        total: result.total,
        limit,
      });
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new PostController();
