/**
 * 🚀 Redis Cache Middleware - Tự động cache responses cho routes
 * Sử dụng cho các routes có traffic cao và data ít thay đổi
 */

import { getOrSetCache, deleteCache, deleteCacheByPrefix } from '../services/redisService.js';

/**
 * Middleware cache response tự động
 * @param {object} options - Cấu hình cache
 * @param {number} options.ttl - Time to live (giây) 
 * @param {string} options.keyPrefix - Prefix cho cache key
 * @param {function} options.keyGenerator - Hàm tự tạo cache key
 * @param {function} options.shouldCache - Hàm kiểm tra có nên cache không
 */
export function cacheResponse(options = {}) {
  const {
    ttl = 300, // Default 5 phút
    keyPrefix = 'api',
    keyGenerator = null,
    shouldCache = null,
  } = options;

  return async (req, res, next) => {
    // Skip cache cho POST, PUT, DELETE, PATCH
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Tạo cache key
    let cacheKey;
    if (keyGenerator && typeof keyGenerator === 'function') {
      cacheKey = keyGenerator(req);
    } else {
      // Default: dựa trên URL + query params
      const queryString = JSON.stringify(req.query);
      const params = JSON.stringify(req.params);
      cacheKey = `${keyPrefix}:${req.path}:q${queryString}:p${params}`;
    }

    try {
      // Kiểm tra cache
      const cached = await getOrSetCache(
        cacheKey,
        async () => {
          // Intercept res.json để cache response
          return new Promise((resolve, reject) => {
            const originalJson = res.json.bind(res);
            
            res.json = function(data) {
              // Kiểm tra có nên cache không
              if (shouldCache && typeof shouldCache === 'function') {
                if (!shouldCache(req, data)) {
                  return originalJson(data);
                }
              }

              // Chỉ cache response thành công
              if (data && data.success !== false) {
                resolve(data);
                return originalJson(data);
              } else {
                return originalJson(data);
              }
            };

            // Tiếp tục xử lý request
            next();
          });
        },
        ttl
      );

      // Nếu có cached data, trả về luôn
      if (cached) {
        return res.json(cached);
      }

    } catch (error) {
      console.error('Cache middleware error:', error);
      // Nếu cache lỗi, tiếp tục xử lý bình thường
      next();
    }
  };
}

/**
 * Middleware để invalidate cache khi có mutations
 * Sử dụng cho POST, PUT, DELETE routes
 */
export function invalidateCache(patterns = []) {
  return async (req, res, next) => {
    // Lưu original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json để invalidate cache sau khi response
    res.json = async function(data) {
      // Gọi original json trước
      const result = originalJson(data);
      
      // Invalidate cache nếu response thành công
      if (data && data.success !== false) {
        try {
          for (const pattern of patterns) {
            await deleteCacheByPrefix(pattern);
            console.log(`🔴 Invalidated cache pattern: ${pattern}`);
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
      
      return result;
    };
    
    next();
  };
}

/**
 * Preset cache configs cho các endpoints phổ biến
 */
export const CachePresets = {
  // Cache cho listing posts (30 phút)
  postsList: cacheResponse({
    ttl: 1800,
    keyPrefix: 'posts:list',
    keyGenerator: (req) => {
      const { page = 1, limit = 20, status, propertyType, province, district, priceRange, sortBy, order } = req.query;
      return `posts:list:s${status || 'active'}:t${propertyType || 'all'}:p${province || 'all'}:d${district || 'all'}:pr${priceRange || 'all'}:sort${sortBy || 'date'}:o${order || 'desc'}:pg${page}:l${limit}`;
    },
    shouldCache: (req, data) => {
      // Chỉ cache nếu có data
      return data && data.data && data.data.items && data.data.items.length > 0;
    }
  }),

  // Cache cho post detail (15 phút)
  postDetail: cacheResponse({
    ttl: 900,
    keyPrefix: 'posts:detail',
    keyGenerator: (req) => {
      return `posts:detail:${req.params.id}`;
    },
    shouldCache: (req, data) => {
      return data && data.data;
    }
  }),

  // Cache cho search suggestions (5 phút)
  suggestions: cacheResponse({
    ttl: 300,
    keyPrefix: 'posts:suggestions',
    keyGenerator: (req) => {
      const { q = '', limit = 5, propertyType, province } = req.query;
      return `posts:suggestions:q${q}:t${propertyType || 'all'}:p${province || 'all'}:l${limit}`;
    }
  }),

  // Cache cho recommendations (1 giờ)
  recommendations: cacheResponse({
    ttl: 3600,
    keyPrefix: 'posts:recommend',
    keyGenerator: (req) => {
      const { limit = 5 } = req.query;
      return `posts:recommend:${req.params.id}:l${limit}`;
    }
  }),

  // Cache cho search results (10 phút)
  search: cacheResponse({
    ttl: 600,
    keyPrefix: 'posts:search',
    keyGenerator: (req) => {
      const { q, page = 1, limit = 20, propertyType, province, district, priceRange } = req.query;
      return `posts:search:q${q}:t${propertyType || 'all'}:p${province || 'all'}:d${district || 'all'}:pr${priceRange || 'all'}:pg${page}:l${limit}`;
    }
  }),

  // Cache cho stats/analytics (1 giờ)
  stats: cacheResponse({
    ttl: 3600,
    keyPrefix: 'stats',
    keyGenerator: (req) => {
      return `stats:${req.path}:${JSON.stringify(req.query)}`;
    }
  }),
};

/**
 * Invalidation patterns cho mutations
 */
export const InvalidationPatterns = {
  // Khi tạo/update/delete post → xóa cache posts
  posts: ['posts:list:', 'posts:search:', 'posts:suggestions:', 'posts:recommend:'],
  
  // Khi update room → xóa cache liên quan
  rooms: ['posts:list:', 'posts:detail:', 'posts:search:'],
  
  // Khi có activity mới → xóa stats cache
  stats: ['stats:', 'analytics:'],
};

export default {
  cacheResponse,
  invalidateCache,
  CachePresets,
  InvalidationPatterns,
};
