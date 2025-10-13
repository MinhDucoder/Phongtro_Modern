import cache from '~/middlewares/cacheMiddleware.js';

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
    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== undefined) {
      console.log(`Cache hit for key: ${key}`);
      return cached;
    }

    // Cache miss - fetch data and cache it
    console.log(`Cache miss for key: ${key}, fetching data...`);
    const data = await fetchFn();
    
    // Cache the data
    cache.set(key, data, ttl);
    console.log(`Cached data for key: ${key}, TTL: ${ttl}s`);
    
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
    cache.set(key, value, ttl);
    console.log(`Set cache for key: ${key}, TTL: ${ttl}s`);
    return true;
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
    const value = cache.get(key);
    if (value !== undefined) {
      console.log(`Cache hit for key: ${key}`);
    } else {
      console.log(`Cache miss for key: ${key}`);
    }
    return value;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return undefined;
  }
}

/**
 * Delete cache value
 * @param {string} key - Cache key
 * @returns {number} - Number of keys deleted
 */
export function deleteCache(key) {
  try {
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
    cache.flushAll();
    console.log('Cleared all cache');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export function getCacheStats() {
  try {
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
  deleteCache,
  clearAllCache,
  getCacheStats
};
