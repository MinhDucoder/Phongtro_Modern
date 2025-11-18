# Backend Testing Guide - Phongtro Modern

Comprehensive integration tests cho Phongtro Modern backend, bao gồm:
- **Rating API Tests** (54 test cases)
- **Post API Tests** (42 test cases)  
- **Auth API Tests** (30 test cases)

## 🛠️ Setup & Configuration

### 1. Cài đặt Dependencies

```bash
cd server
npm install
```

Packages cần thiết (đã có trong package.json):
- `jest` - Test framework
- `supertest` - HTTP assertion library
- `bcryptjs` - Password hashing
- `mongodb` - Database
- `mongoose` - ODM

### 2. Cấu hình Environment

Tests sử dụng `.env` của project:

```env
MONGODB_URI=mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN
JWT_SECRET=asdfsadfsadf
JWT_REFRESH_SECRET=asdfkljhasdfsadf
NODE_ENV=test
```

### 3. Chuẩn bị Database

Đảm bảo MongoDB đang chạy:

```bash
# MongoDB Atlas (cloud)
# Hoặc local MongoDB
mongod
```

## 🚀 Chạy Tests

### Chạy tất cả tests:

```bash
npm test
```

### Chạy tests theo category:

```bash
# Test Rating API
npm run test:rating

# Test Post API
npm run test:post

# Test Auth API
npm run test:auth
```

### Chạy tests ở chế độ watch (tự động rerun khi file thay đổi):

```bash
npm run test:watch
```

### Chạy tests với coverage report:

```bash
npm test -- --coverage
```

## Test Files

### 1. **Rating Tests** (`src/tests/rating.test.js`)

Test các endpoints liên quan đến rating:

- ✅ `POST /api/v1/posts/:id/rating` - Tạo/cập nhật rating
- ✅ `GET /api/v1/posts/:id/ratings` - Lấy danh sách ratings
- ✅ `DELETE /api/v1/posts/:id/rating` - Xóa rating
- ✅ Post averageRating calculation

**Test cases:**
- Create rating successfully
- Reject invalid rating (< 1 hoặc > 5)
- Landlord cannot rate own post
- Update rating if user already rated
- List ratings with pagination
- Filter ratings by star
- Delete rating
- Update post averageRating after rating change

### 2. **Post Tests** (`src/tests/post.test.js`)

Test các endpoints liên quan đến posts:

- ✅ `GET /api/v1/posts` - List posts
- ✅ `GET /api/v1/posts/:id` - Get post detail
- ✅ `POST /api/v1/posts` - Create post
- ✅ `PUT /api/v1/posts/:id` - Update post
- ✅ `DELETE /api/v1/posts/:id` - Delete post
- ✅ `GET /api/v1/posts/suggestions/latest` - Get suggestions
- ✅ `GET /api/v1/posts/:id/recommend` - Get recommendations

**Test cases:**
- List all active posts
- Search posts by keyword (unicode support)
- Filter by propertyType, price range, city, district
- Pagination support
- Sorting support
- Get post detail
- Create post
- Update post
- Delete post
- Get suggestions with filters
- Get recommendations
- Search fallback (MeiliSearch to MongoDB)

### 3. **Auth Tests** (`src/tests/auth.test.js`)

Test các endpoints liên quan đến authentication:

- ✅ `POST /api/v1/auth/register` - Đăng ký tài khoản
- ✅ `POST /api/v1/auth/login` - Đăng nhập
- ✅ `POST /api/v1/auth/logout` - Đăng xuất
- ✅ `GET /api/v1/auth/me` - Lấy profile hiện tại
- ✅ `POST /api/v1/auth/refresh` - Refresh token
- ✅ `POST /api/v1/auth/forgot-password` - Forgot password

**Test cases:**
- Register new user
- Email validation
- Password strength validation
- Duplicate email prevention
- Login with correct credentials
- Login with incorrect password
- User not found
- Logout user
- Get current user profile
- Invalid token handling
- Refresh token
- Forgot password flow

## Cấu trúc Tests

Mỗi test file theo pattern:

```javascript
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import YourModel from "../models/yourModel.js";

describe("Feature Tests", () => {
  beforeAll(async () => {
    // Setup: Kết nối database, tạo test data
  });

  afterAll(async () => {
    // Cleanup: Xóa test data, đóng database connection
  });

  describe("API Endpoint", () => {
    it("should do something", async () => {
      const res = await request(app)
        .get("/api/v1/endpoint")
        .query({ param: "value" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });
});
```

## Viết Tests Mới

### Template Test:

```javascript
import request from "supertest";
import app from "../server.js";

describe("Your Feature", () => {
  describe("GET /api/v1/your-endpoint", () => {
    it("should return data successfully", async () => {
      const res = await request(app)
        .get("/api/v1/your-endpoint")
        .query({ page: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      const res = await request(app)
        .get("/api/v1/your-endpoint")
        .query({ invalid: "param" });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
```

### Assertions phổ biến:

```javascript
// Status codes
expect(res.status).toBe(200);
expect(res.status).toBeGreaterThan(399);

// Body content
expect(res.body.data).toBeDefined();
expect(res.body.data._id).toBe(expectedId);
expect(Array.isArray(res.body.data.items)).toBe(true);

// Headers
expect(res.headers["content-type"]).toContain("application/json");

// Arrays
expect(res.body.data).toContainEqual(expectedObject);
res.body.data.forEach(item => {
  expect(item.id).toBeDefined();
});
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# If not running, start it
mongod
```

### Port Already in Use

```bash
# Find and kill process on port 27017
lsof -i :27017
kill -9 <PID>
```

### Tests Timeout

Nếu tests bị timeout, hãy tăng `testTimeout`:

```javascript
jest.setTimeout(60000); // 60 seconds
```

### Module Import Issues

Đảm bảo `package.json` có:
```json
"type": "module"
```

## Best Practices

1. **Isolate Tests**: Mỗi test nên độc lập, không phụ thuộc vào test khác
2. **Clean Data**: Luôn cleanup test data sau khi hoàn thành
3. **Use Fixtures**: Sử dụng fixture data để setup consistent state
4. **Mock External Services**: Mock các external APIs (email, SMS, etc)
5. **Test Error Cases**: Luôn test cả happy path và error scenarios
6. **Use Meaningful Names**: Đặt tên test rõ ràng, mô tả rõ expected behavior

## CI/CD Integration

Để integrate tests vào CI/CD pipeline (GitHub Actions, GitLab CI, etc):

```yaml
# .github/workflows/test.yml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd server && npm install
      - run: cd server && npm test
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Express Testing Best Practices](https://expressjs.com/en/advanced/best-practice-testing.html)
- [MongoDB Testing](https://docs.mongodb.com/manual/development/testing/)
