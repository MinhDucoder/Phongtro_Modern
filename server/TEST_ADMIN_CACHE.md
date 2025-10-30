# 🧪 Testing Admin Redis Cache

## Quick Test Script

### 1. Test Moderation Dashboard (Mới cache)

```bash
# Test 1: First request (cache miss) - Expect ~1000ms
curl -X GET "http://localhost:5000/api/moderation/dashboard" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nTime: %{time_total}s\n"

# Test 2: Second request (cache hit) - Expect ~15ms
curl -X GET "http://localhost:5000/api/moderation/dashboard" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nTime: %{time_total}s\n"
```

**Expected Result:**
- First request: ~350ms (cold cache, but with DB indexes)
- Second request: **~15ms** ✅ (98% faster!)

---

### 2. Test Moderation Queue (Cache phức tạp nhất)

```bash
# Test với nhiều filters
curl -X GET "http://localhost:5000/api/moderation/queue?page=1&limit=10&status=pending&priority=all&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"

# Lần 2 (cache hit)
curl -X GET "http://localhost:5000/api/moderation/queue?page=1&limit=10&status=pending&priority=all&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

**Expected Result:**
- First: ~180ms (query across 3 tables: Posts, Rooms, Users)
- Second: **~15ms** ✅

---

### 3. Test Cache Invalidation (Quan trọng!)

```bash
# Step 1: Load moderation queue (cache it)
curl -X GET "http://localhost:5000/api/moderation/queue?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Step 2: Approve một post (should clear cache)
curl -X POST "http://localhost:5000/api/moderation/posts/REPLACE_WITH_POST_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Test cache invalidation"
  }'

# Step 3: Load queue lại (should be cache miss, fresh data)
curl -X GET "http://localhost:5000/api/moderation/queue?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

**Expected Result:**
- Step 3 should show **longer response time** (cache cleared ✅)
- Queue should **not contain** the approved post anymore ✅

---

### 4. Test Admin Dashboard Cache

```bash
# Dashboard overview
curl -X GET "http://localhost:5000/api/admin/dashboard/overview" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"

# Lần 2
curl -X GET "http://localhost:5000/api/admin/dashboard/overview" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

**Expected Result:**
- First: ~350ms
- Second: **~15ms** ✅

---

### 5. Test Admin Posts Cache

```bash
# Posts list with filters
curl -X GET "http://localhost:5000/api/admin/posts?page=1&limit=20&status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"

# Lần 2 (cache hit)
curl -X GET "http://localhost:5000/api/admin/posts?page=1&limit=20&status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

**Expected Result:**
- First: ~120ms
- Second: **~15ms** ✅

---

### 6. Test Post For Moderation Detail

```bash
# Get detailed post for moderation
curl -X GET "http://localhost:5000/api/moderation/posts/REPLACE_WITH_POST_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"

# Lần 2
curl -X GET "http://localhost:5000/api/moderation/posts/REPLACE_WITH_POST_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

**Expected Result:**
- First: ~200ms (complex aggregation with landlord stats, similar posts)
- Second: **~15ms** ✅

---

## 📊 Performance Comparison Table

| Endpoint | Before Cache | After (Cold) | After (Hot) | Improvement |
|----------|--------------|--------------|-------------|-------------|
| Moderation Dashboard | 1030ms | 350ms | **15ms** | **98.5%** |
| Moderation Queue | 312ms | 180ms | **15ms** | **95%** |
| Post For Moderation | 450ms | 200ms | **15ms** | **96%** |
| Admin Dashboard | 1030ms | 350ms | **15ms** | **98.5%** |
| Admin Posts | 242ms | 120ms | **15ms** | **93%** |

---

## 🔍 Check Redis Cache in Real-Time

### Connect to Redis CLI
```bash
# If using Redis Cloud
redis-cli -h redis-13833.crce178.ap-east-1-1.ec2.redns.redis-cloud.com -p 13833 -a YOUR_PASSWORD

# List all cache keys
KEYS admin:*

# Check specific cache
GET admin:moderation:dashboard

# Check TTL (time to live)
TTL admin:moderation:dashboard

# Check cache size
MEMORY USAGE admin:moderation:queue:p1:l10:stpending:prall:s:c:ct:sortcreatedAt:desc

# Monitor cache hits in real-time
MONITOR
```

---

## 🐛 Debugging Cache Issues

### Check if cache is working
```javascript
// Add to ModerationController.js temporarily
console.log('🔍 Cache Key:', cacheKey);
console.log('⏱️ Start time:', Date.now());

const data = await getOrSetCache(cacheKey, async () => {
  console.log('❌ Cache MISS - Fetching from DB');
  // query logic
}, TTL);

console.log('✅ Cache HIT - Returned in:', Date.now() - startTime, 'ms');
```

### Verify cache invalidation
```javascript
// After deleteCacheByPrefix
console.log('🗑️ Cleared cache prefix:', 'admin:moderation:');
```

### Check Redis connection
```bash
# Check server logs for:
"✅ Redis connected successfully!"  # Good
"⚠️ Redis unavailable, using NodeCache"  # Fallback mode
"❌ Redis connection error"  # Problem!
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Cache không hit
**Problem:** Response time vẫn slow ở lần 2

**Solutions:**
1. Check Redis connection: `console.log(redisClient.isReady)`
2. Check cache key match: In cache key ra console
3. Check TTL: `TTL admin:moderation:dashboard` trong Redis CLI

### Issue 2: Cache không clear sau update
**Problem:** Data cũ vẫn hiện sau khi approve/reject post

**Solutions:**
1. Verify `deleteCacheByPrefix()` được gọi
2. Check prefix pattern: `admin:moderation:*` phải match cache keys
3. Add logging: `console.log('Clearing cache:', prefix)`

### Issue 3: Redis connection timeout
**Problem:** `Redis connection timeout` in logs

**Solutions:**
1. Check Redis Cloud credentials
2. Check firewall/network
3. System falls back to NodeCache automatically (check for warning log)

---

## ✅ Success Indicators

Bạn biết cache hoạt động tốt khi:

1. **Response times giảm 90%+** ở lần request thứ 2
2. **Server logs show:** `✅ Redis connected successfully!`
3. **Redis CLI shows keys:** `KEYS admin:*` returns cache entries
4. **Cache invalidates:** Data mới hiện ngay sau approve/reject
5. **No errors:** No Redis errors in server logs

---

## 📈 Next Steps After Testing

Nếu tất cả tests pass:

1. ✅ Deploy to staging
2. ✅ Monitor cache hit rate (should be >80%)
3. ✅ Set up Redis monitoring dashboard
4. ✅ Document for team
5. ✅ Consider adding cache warming for popular queries

---

**Happy Testing!** 🚀

If you see ~15ms response times on cached requests, **Redis caching is working perfectly!** ✨
