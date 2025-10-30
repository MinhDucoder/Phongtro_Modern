// src/controllers/postController.js
import postService from "../services/postService.js";
import { searchPosts } from "../services/meiliSearchService.js";
import { success, error } from "../utils/responeHandler.js";
import viewTrackingService from "../services/viewTrackingService.js";
import { getOrSetCache, deleteCache, deleteCacheByPrefix } from "../services/redisService.js";

class PostController {
  async create(req, res, next) {
    try {
      console.log('=== POST CREATE REQUEST ===');
      console.log('User ID:', req.user?.id);
      console.log('Request Body:', req.body);
      
      const post = await postService.createPost(req.user.id, req.body);
      
      // ❌ Clear cache khi tạo post mới
      console.log('🔴 Clearing posts cache after create...');
      await deleteCacheByPrefix('posts:list:');
      await deleteCacheByPrefix('posts:suggestions:');
      await deleteCacheByPrefix('posts:recommend:');
      await deleteCacheByPrefix('admin:dashboard'); // Xóa cache dashboard
      console.log('✅ Dashboard cache invalidated after new post');
      
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
        // 🔹 Cache key cho MeiliSearch results
        const cacheKey = `posts:search:${keyword}:${JSON.stringify(req.query)}:p${page}:l${limit}`;
        
        const cachedResult = await getOrSetCache(
          cacheKey,
          async () => {
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
            
            // Add price range filter
            if (req.query.priceRange) {
              const priceMap = {
                'duoi-1-trieu': { min: 0, max: 1000000 },
                '1-2-trieu': { min: 1000000, max: 2000000 },
                '2-3-trieu': { min: 2000000, max: 3000000 },
                '3-5-trieu': { min: 3000000, max: 5000000 },
                '5-7-trieu': { min: 5000000, max: 7000000 },
                '7-10-trieu': { min: 7000000, max: 10000000 },
                '10-15-trieu': { min: 10000000, max: 15000000 },
                'tren-15-trieu': { min: 15000000, max: 999999999 },
              };
              
              const range = priceMap[req.query.priceRange];
              if (range) {
                filters.minPrice = range.min;
                filters.maxPrice = range.max;
              }
            }
            
            const options = {
              page,
              limit,
              sortBy: req.query.sortBy || 'relevance',
              filters,
            };
            
            const meiliResults = await searchPosts(keyword, options);
            
            return {
              total: meiliResults.totalHits,
              items: meiliResults.hits,
              page: meiliResults.page,
              limit: meiliResults.limit,
              totalPages: meiliResults.totalPages,
            };
          },
          600 // TTL 10 phút cho search results
        );
        
        return success(res, cachedResult);
      }
      
      // Nếu không có keyword → dùng MongoDB với Redis cache
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
      
      // Filter theo price range
      if (req.query.priceRange) {
        const priceMap = {
          'duoi-1-trieu': { min: 0, max: 1000000 },
          '1-2-trieu': { min: 1000000, max: 2000000 },
          '2-3-trieu': { min: 2000000, max: 3000000 },
          '3-5-trieu': { min: 3000000, max: 5000000 },
          '5-7-trieu': { min: 5000000, max: 7000000 },
          '7-10-trieu': { min: 7000000, max: 10000000 },
          '10-15-trieu': { min: 10000000, max: 15000000 },
          'tren-15-trieu': { min: 15000000, max: 999999999 },
        };
        
        const range = priceMap[req.query.priceRange];
        if (range) {
          filters["roomId.price"] = { $gte: range.min, $lte: range.max };
        }
      }

      if (req.query.sortBy) {
        sort[req.query.sortBy] = req.query.order === "asc" ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      // 🔹 Redis cache key dựa trên filters, sort, page, limit
      const cacheKey = `posts:list:${JSON.stringify(filters)}:${JSON.stringify(sort)}:p${page}:l${limit}`;
      
      const result = await getOrSetCache(
        cacheKey,
        async () => {
          return await postService.listPosts({ page, limit, filters, sort });
        },
        1800 // TTL 30 phút cho list posts
      );
      
      // Thêm headers chống cache trình duyệt (nhưng vẫn dùng Redis cache)
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
      const postId = req.params.id;
      
      // 🔹 Cache post detail với TTL 15 phút
      const cacheKey = `posts:detail:${postId}`;
      
      const post = await getOrSetCache(
        cacheKey,
        async () => {
          return await postService.getPostById(postId);
        },
        900 // TTL 15 phút
      );
      
      // Ghi nhận view/visit (không chặn response nếu có lỗi nhỏ)
      try {
        await viewTrackingService.incrementPostView(req, postId);
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
      const postId = req.params.id;
      const post = await postService.updatePost(postId, req.user.id, req.body);
      
      // ❌ Clear cache sau khi update
      console.log('🔴 Clearing cache after update post:', postId);
      await deleteCache(`posts:detail:${postId}`);
      await deleteCacheByPrefix('posts:list:');
      await deleteCacheByPrefix('posts:suggestions:');
      await deleteCacheByPrefix(`posts:recommend:${postId}`);
      
      return success(res, post);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async remove(req, res, next) {
    try {
      const postId = req.params.id;
      await postService.deletePost(postId, req.user.id);
      
      // ❌ Clear cache sau khi xóa
      console.log('🔴 Clearing cache after delete post:', postId);
      await deleteCache(`posts:detail:${postId}`);
      await deleteCacheByPrefix('posts:list:');
      await deleteCacheByPrefix('posts:suggestions:');
      await deleteCacheByPrefix(`posts:recommend:${postId}`);
      
      return success(res, null, 204);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Lấy 6 phòng trọ mới nhất được đăng (suggestions real-time)
  async suggestions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const keyword = req.query.q?.trim();
      
      // 🔹 Cache key cho suggestions
      const cacheKey = `posts:suggestions:${keyword || 'latest'}:${JSON.stringify(req.query)}:l${limit}`;
      
      const result = await getOrSetCache(
        cacheKey,
        async () => {
          const filters = {};
          
          // Lấy từ MeiliSearch hoặc MongoDB
          // Nếu có keyword → dùng MeiliSearch
          if (keyword && keyword.length > 0) {
            // Tìm kiếm real-time với keyword và sắp xếp theo mới nhất
            const options = {
              page: 1,
              limit,
              sortBy: 'createdAt:desc',
              filters: {},
            };
            
            const meiliResults = await searchPosts(keyword, options);
            
            return {
              items: meiliResults.hits,
              total: meiliResults.totalHits,
              limit,
            };
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
          const listResult = await postService.listPosts({ page: 1, limit, filters, sort });
          
          return {
            items: listResult.items,
            total: listResult.total,
            limit,
          };
        },
        300 // TTL 5 phút cho suggestions (ngắn hơn vì cần real-time)
      );
      
      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  /**
   * 🧠 Gợi ý bài đăng tương tự dựa trên Machine Learning (Collaborative Filtering)
   * Gọi Python Flask API để lấy recommendation posts
   * @route GET /api/v1/posts/:id/recommend
   */
  async recommendPosts(req, res, next) {
    try {
      const postId = req.params.id;
      const limit = parseInt(req.query.limit) || 5;

      // 🔹 Cache recommendations với TTL 1 giờ
      const cacheKey = `posts:recommend:${postId}:l${limit}`;
      
      const result = await getOrSetCache(
        cacheKey,
        async () => {
          // 1️⃣ Kiểm tra post có tồn tại không
          const post = await postService.getPostById(postId);
          if (!post) {
            throw new Error("Bài đăng không tồn tại");
          }

          // 2️⃣ Gọi Python Flask API để lấy recommendations
          const pythonApiUrl = process.env.PYTHON_RS_API_URL || "http://localhost:6000";
          
          const response = await fetch(
            `${pythonApiUrl}/recommendPosts?postId=${postId}&limit=${limit}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Python API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          // 3️⃣ Trả về kết quả
          if (data.success && data.data) {
            return {
              postId,
              recommendations: data.data,
              total: data.data.length,
            };
          } else {
            throw new Error("Invalid response from recommendation service");
          }
        },
        3600 // TTL 1 giờ cho recommendations (tương đối stable)
      );
      
      return success(res, result);

    } catch (err) {
      console.error("🔴 Recommendation API Error:", err.message);
      
      // 4️⃣ Fallback: Nếu Python API lỗi → dùng MongoDB với cache
      try {
        const postId = req.params.id;
        const limit = parseInt(req.query.limit) || 5;
        
        // Cache key cho fallback
        const fallbackCacheKey = `posts:recommend:fallback:${postId}:l${limit}`;
        
        const fallbackResult = await getOrSetCache(
          fallbackCacheKey,
          async () => {
            const post = await postService.getPostById(postId);
            
            // Lấy posts tương tự dựa trên propertyType và city
            const filters = {
              status: "active",
              _id: { $ne: postId }, // Loại bỏ chính nó
            };
            
            if (post.roomId?.propertyType) {
              filters["roomId.propertyType"] = post.roomId.propertyType;
            }
            
            if (post.roomId?.city) {
              filters["roomId.city"] = post.roomId.city;
            }
            
            const sort = { createdAt: -1 };
            
            const result = await postService.listPosts({ 
              page: 1, 
              limit, 
              filters, 
              sort 
            });
            
            return {
              postId,
              recommendations: result.items,
              total: result.items.length,
              fallback: true, // Đánh dấu là fallback
              message: "Using fallback recommendation (Python API unavailable)"
            };
          },
          1800 // TTL 30 phút cho fallback
        );
        
        return success(res, fallbackResult);
        
      } catch (fallbackErr) {
        return error(res, "Không thể lấy gợi ý bài đăng: " + fallbackErr.message, 500);
      }
    }
  }
}

export default new PostController();
