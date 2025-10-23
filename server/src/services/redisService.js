import cache from '~/middlewares/cacheMiddleware.js';

// Optional Redis via ioredis
let redis = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const { default: IORedis } = await import('ioredis');
  redis = new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 2,
  });
  // Light ping to ensure connectivity (non-blocking)
  redis.ping().catch(() => {});
} catch (e) {
  // Redis not available, fallback to in-memory cache
  redis = null;
}

/**
 * Simple cache service that mimics Redis functionality using NodeCache
 * This provides a consistent interface for caching operations
 */

/**
 * Get or set cache value
 * @param {string} key - Cache key
 * @param {function} fetchFn - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds (default: 300)
 * @returns {Promise<any>} - Cached or fetched data
 */
export async function getOrSetCache(key, fetchFn, ttl = 300) {
  try {
    if (redis) {
      const cached = await redis.get(key);
      if (cached !== null) {
        if (!String(key).startsWith('blacklist:')) {
          const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
          console.log(`Cache hit (redis) for key: ${safe}`);
        }
        try { return JSON.parse(cached); } catch { return cached; }
      }
    } else {
      const cached = cache.get(key);
      if (cached !== undefined) {
        if (!String(key).startsWith('blacklist:')) {
          const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
          console.log(`Cache hit for key: ${safe}`);
        }
        return cached;
      }
    }

    // Cache miss - optional anti-stampede lock (Redis only)
    if (redis) {
      try {
        const lockKey = `${key}:lock`;
        const locked = await redis.set(lockKey, '1', 'NX', 'EX', 10);
        if (!locked) {
          await new Promise((r) => setTimeout(r, 120));
          const retry = await redis.get(key);
          if (retry !== null) {
            try { return JSON.parse(retry); } catch { return retry; }
          }
        }
      } catch {}
    }
    if (!String(key).startsWith('blacklist:')) {
      const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
      console.log(`Cache miss for key: ${safe}, fetching data...`);
    }
    const data = await fetchFn();
    
    // Cache the data
    if (redis) {
      const value = typeof data === 'string' ? data : JSON.stringify(data);
      await redis.set(key, value, 'EX', ttl);
      if (!String(key).startsWith('blacklist:')) {
        const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
        console.log(`Cached (redis) data for key: ${safe}, TTL: ${ttl}s`);
      }
      try { await redis.del(`${key}:lock`); } catch {}
    } else {
      cache.set(key, data, ttl);
      if (!String(key).startsWith('blacklist:')) {
        const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
        console.log(`Cached data for key: ${safe}, TTL: ${ttl}s`);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getOrSetCache for key ${key}:`, error);
    // If cache fails, still try to fetch data
    return await fetchFn();
  }
}

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300)
 * @returns {boolean} - Success status
 */
export function setCache(key, value, ttl = 300) {
  try {
    if (redis) {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      redis.set(key, val, 'EX', ttl);
      const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
      console.log(`Set cache (redis) for key: ${safe}, TTL: ${ttl}s`);
      return true;
    } else {
      cache.set(key, value, ttl);
      const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
      console.log(`Set cache for key: ${safe}, TTL: ${ttl}s`);
      return true;
    }
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Get cache value
 * @param {string} key - Cache key
 * @returns {any} - Cached value or undefined
 */
export function getCache(key) {
  try {
    if (redis) {
      return redis.get(key);
    }
    const value = cache.get(key);
    if (value !== undefined) {
      const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
      console.log(`Cache hit for key: ${safe}`);
    } else {
      const safe = typeof key === 'string' ? `${key.slice(0, 16)}...(${key.length})` : 'unknown';
      console.log(`Cache miss for key: ${safe}`);
    }
    return value;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return undefined;
  }
}

/**
 * Check if a cache key exists (fast path for Redis), no logging
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function existsCache(key) {
  try {
    if (redis) {
      const exists = await redis.exists(key);
      return exists === 1;
    }
    return cache.get(key) !== undefined;
  } catch (error) {
    return false;
  }
}

/**
 * Delete cache value
 * @param {string} key - Cache key
 * @returns {number} - Number of keys deleted
 */
export function deleteCache(key) {
  try {
    if (redis) {
      return redis.del(key);
    }
    const deleted = cache.del(key);
    console.log(`Deleted cache for key: ${key}`);
    return deleted;
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
    return 0;
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  try {
    if (redis) {
      // Warning: FLUSHALL clears entire Redis; avoid in shared envs
      redis.flushall();
      console.log('Cleared all redis cache');
    } else {
      cache.flushAll();
      console.log('Cleared all cache');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Delete all cache keys matching a prefix (helper for NodeCache)
 * @param {string} prefix - Key prefix like `messages:<conversationId>:`
 */
export function deleteCacheByPrefix(prefix) {
  try {
    if (redis) {
      // Use SCAN to iterate keys by prefix
      const pattern = `${prefix}*`;
      let cursor = '0';
      let total = 0;
      const pipeline = redis.pipeline();
      const keysToDelete = [];
      const loop = async () => {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length) {
          keys.forEach((k) => { keysToDelete.push(k); pipeline.del(k); });
        }
        if (cursor !== '0') {
          await loop();
        }
      };
      return loop().then(() => pipeline.exec()).then((results) => {
        total = keysToDelete.length;
        console.log(`Deleted ${total} redis cache keys by prefix: ${prefix}`);
        return total;
      });
    }
    const keys = cache.keys();
    const toDelete = keys.filter((k) => k.startsWith(prefix));
    if (toDelete.length > 0) {
      cache.del(toDelete);
      console.log(`Deleted ${toDelete.length} cache keys by prefix: ${prefix}`);
    }
    return toDelete.length;
  } catch (error) {
    console.error(`Error deleting cache by prefix ${prefix}:`, error);
    return 0;
  }
}

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export function getCacheStats() {
  try {
    if (redis) {
      return { engine: 'redis' };
    }
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      ksize: cache.getStats().ksize,
      vsize: cache.getStats().vsize
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      keys: 0,
      hits: 0,
      misses: 0,
      ksize: 0,
      vsize: 0
    };
  }
}

export default {
  getOrSetCache,
  setCache,
  getCache,
  existsCache,
  deleteCache,
  clearAllCache,
  getCacheStats,
  deleteCacheByPrefix
};
