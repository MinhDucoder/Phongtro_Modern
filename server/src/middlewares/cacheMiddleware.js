// middlewares/cacheMiddleware.js
import NodeCache from 'node-cache';

// Tạo cache instance với TTL (Time To Live)
const cache = new NodeCache({ 
  stdTTL: 300, // 5 phút mặc định
  checkperiod: 120, // Kiểm tra expired keys mỗi 2 phút
  useClones: false // Không clone objects để tiết kiệm memory
});

// Middleware để cache responses
export const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Tạo cache key từ URL và query params
    const cacheKey = `${req.originalUrl}_${JSON.stringify(req.query)}`;
    
    // Kiểm tra cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheTime: new Date().toISOString()
      });
    }

    // Lưu original res.json để override
    const originalJson = res.json;
    
    // Override res.json để cache response
    res.json = function(data) {
      // Chỉ cache nếu response thành công
      if (data.success && data.data) {
        cache.set(cacheKey, data.data, ttl);
        console.log(`Cached data for key: ${cacheKey}, TTL: ${ttl}s`);
      }
      
      // Gọi original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Middleware để clear cache
export const clearCache = (pattern = null) => {
  if (pattern) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));
    cache.del(keysToDelete);
    console.log(`Cleared cache for pattern: ${pattern}, keys: ${keysToDelete.length}`);
  } else {
    cache.flushAll();
    console.log('Cleared all cache');
  }
};

// Middleware để clear cache khi có thay đổi data
export const invalidateStatsCache = () => {
  clearCache('/stats');
};

// Utility functions
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

export default cache;


