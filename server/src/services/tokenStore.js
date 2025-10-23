import { setCache, getCache, deleteCache } from './redisService.js';

const USER_REFRESH_JTI_PREFIX = 'auth:refreshJti:user:';
const USER_REFRESH_SET_PREFIX = 'auth:user:'; // auth:user:<userId>:refreshJtis -> Set
const REVOKED_REFRESH_PREFIX = 'auth:revoked:refresh:';

// Fallback in-memory store for development
const tokenStore = new Map();
const revokedStore = new Map();

export async function setUserRefreshJti(userId, jti, ttlSeconds) {
  const key = USER_REFRESH_JTI_PREFIX + String(userId);
  
  try {
    // Try Redis first
    await setCache(key, jti, ttlSeconds);
    console.log(`✅ Stored refresh JTI for user ${userId} in Redis`);
  } catch (error) {
    console.warn(`⚠️ Redis unavailable, using memory store for user ${userId}:`, error.message);
    // Fallback to memory store
    tokenStore.set(key, jti);
    setTimeout(() => tokenStore.delete(key), ttlSeconds * 1000);
  }
}

// Multi-session: support adding/removing JTIs per user (Redis Set preferred)
export async function addUserRefreshJti(userId, jti, ttlSeconds) {
  const setKey = `${USER_REFRESH_SET_PREFIX}${String(userId)}:refreshJtis`;
  try {
    // Prefer Redis commands if available via setCache wrapper (fallback: store as JSON array)
    const existing = await getCache(setKey);
    let setArr = [];
    try { setArr = existing ? JSON.parse(existing) : []; } catch { setArr = Array.isArray(existing) ? existing : []; }
    if (!setArr.includes(jti)) setArr.push(jti);
    await setCache(setKey, JSON.stringify(setArr), ttlSeconds);
  } catch (e) {
    // Fallback memory: reuse tokenStore map
    const memKey = setKey;
    const arr = tokenStore.get(memKey) || [];
    if (!arr.includes(jti)) arr.push(jti);
    tokenStore.set(memKey, arr);
    setTimeout(() => tokenStore.delete(memKey), ttlSeconds * 1000);
  }
}

export async function removeUserRefreshJti(userId, jti) {
  const setKey = `${USER_REFRESH_SET_PREFIX}${String(userId)}:refreshJtis`;
  try {
    const existing = await getCache(setKey);
    let setArr = [];
    try { setArr = existing ? JSON.parse(existing) : []; } catch { setArr = Array.isArray(existing) ? existing : []; }
    const filtered = setArr.filter((x) => x !== jti);
    await setCache(setKey, JSON.stringify(filtered), 30 * 24 * 60 * 60);
  } catch (e) {
    const memKey = setKey;
    const arr = tokenStore.get(memKey) || [];
    tokenStore.set(memKey, arr.filter((x) => x !== jti));
  }
}

export async function getUserRefreshJti(userId) {
  const key = USER_REFRESH_JTI_PREFIX + String(userId);
  
  try {
    // Try Redis first
    const jti = await getCache(key);
    if (jti) {
      console.log(`✅ Retrieved refresh JTI for user ${userId} from Redis`);
      return jti;
    }
  } catch (error) {
    console.warn(`⚠️ Redis unavailable, checking memory store for user ${userId}:`, error.message);
  }
  
  // Fallback to memory store
  return tokenStore.get(key);
}

export async function clearUserRefreshJti(userId) {
  const key = USER_REFRESH_JTI_PREFIX + String(userId);
  
  try {
    // Try Redis first
    await deleteCache(key);
    console.log(`✅ Cleared refresh JTI for user ${userId} from Redis`);
  } catch (error) {
    console.warn(`⚠️ Redis unavailable, clearing memory store for user ${userId}:`, error.message);
  }
  
  // Fallback to memory store
  tokenStore.delete(key);
}

export async function revokeRefreshJti(jti, ttlSeconds) {
  const key = REVOKED_REFRESH_PREFIX + String(jti);
  
  try {
    // Try Redis first
    await setCache(key, 'revoked', ttlSeconds);
    console.log(`✅ Revoked refresh JTI ${jti} in Redis`);
  } catch (error) {
    console.warn(`⚠️ Redis unavailable, revoking JTI ${jti} in memory store:`, error.message);
    // Fallback to memory store
    revokedStore.set(key, true);
    setTimeout(() => revokedStore.delete(key), ttlSeconds * 1000);
  }
}

export async function isRefreshJtiRevoked(jti) {
  const key = REVOKED_REFRESH_PREFIX + String(jti);
  
  try {
    // Try Redis first
    const revoked = await getCache(key);
    if (revoked) {
      console.log(`✅ Checked revoked JTI ${jti} in Redis`);
      return true;
    }
  } catch (error) {
    console.warn(`⚠️ Redis unavailable, checking memory store for JTI ${jti}:`, error.message);
  }
  
  // Fallback to memory store
  return Boolean(revokedStore.get(key));
}

export default {
  setUserRefreshJti,
  getUserRefreshJti,
  clearUserRefreshJti,
  revokeRefreshJti,
  isRefreshJtiRevoked,
};


