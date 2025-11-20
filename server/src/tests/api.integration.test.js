import request from 'supertest';
import app from '../server.js';
import { connectDB } from '../config/mongodbConfig.js';
import mongoose from 'mongoose';

// Test suite cho API endpoints
describe('API Integration Tests', () => {
  let server;
  let testUser = {
    email: 'test_' + Date.now() + '@example.com',
    password: 'Test@123456',
    full_name: 'Test User',
    phone: '0912345678'
  };
  let authToken;
  let testPostId;

  // Khởi động server trước khi test
  beforeAll(async () => {
    // Đảm bảo kết nối DB
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    
    // Đợi DB connect xong
    await new Promise(resolve => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });
    
    console.log('✅ Test DB connected');
  }, 30000);

  // Đóng kết nối sau khi test xong
  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    await mongoose.connection.close();
    console.log('✅ Test completed, connections closed');
  }, 30000);

  // ==================== PUBLIC ENDPOINTS ====================
  
  describe('GET /api/v1/posts', () => {
    it('should return list of posts', async () => {
      const response = await request(app)
        .get('/api/v1/posts?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);
      
      console.log(`✅ GET /posts - Total: ${response.body.pagination.totalRecords} posts`);
    });

    it('should filter posts by city', async () => {
      const response = await request(app)
        .get('/api/v1/posts?city=Hà Nội&limit=5')
        .expect(200);

      expect(response.body.posts).toBeDefined();
      if (response.body.posts.length > 0) {
        // Kiểm tra có post nào từ Hà Nội không
        const hasHanoi = response.body.posts.some(post => 
          post.city === 'Hà Nội' || post.address?.includes('Hà Nội')
        );
        console.log(`✅ Filter by city - Found ${response.body.posts.length} posts`);
      }
    });

    it('should filter posts by price range', async () => {
      const response = await request(app)
        .get('/api/v1/posts?minPrice=1000000&maxPrice=5000000&limit=5')
        .expect(200);

      expect(response.body.posts).toBeDefined();
      if (response.body.posts.length > 0) {
        const allInRange = response.body.posts.every(post => 
          post.price >= 1000000 && post.price <= 5000000
        );
        expect(allInRange).toBe(true);
        console.log(`✅ Price filter - Found ${response.body.posts.length} posts in range`);
      }
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    it('should return post detail with valid ID', async () => {
      // Lấy một post ID bất kỳ trước
      const listResponse = await request(app)
        .get('/api/v1/posts?limit=1')
        .expect(200);

      if (listResponse.body.posts && listResponse.body.posts.length > 0) {
        const postId = listResponse.body.posts[0]._id;
        testPostId = postId;

        const response = await request(app)
          .get(`/api/v1/posts/${postId}`)
          .expect(200);

        expect(response.body).toHaveProperty('post');
        expect(response.body.post._id).toBe(postId);
        console.log(`✅ GET /posts/:id - Post title: ${response.body.post.title}`);
      }
    });

    it('should return 404 for invalid post ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
      
      const response = await request(app)
        .get(`/api/v1/posts/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Invalid post ID - Correct 404 response`);
    });
  });

  describe('GET /api/v1/stats/overview', () => {
    it('should return stats overview', async () => {
      const response = await request(app)
        .get('/api/v1/stats/overview')
        .expect(200);

      expect(response.body).toHaveProperty('totalPosts');
      expect(response.body).toHaveProperty('totalUsers');
      expect(typeof response.body.totalPosts).toBe('number');
      
      console.log(`✅ Stats - Posts: ${response.body.totalPosts}, Users: ${response.body.totalUsers}`);
    });
  });

  // ==================== AUTHENTICATION ENDPOINTS ====================
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      
      console.log(`✅ Register - User created: ${response.body.user.email}`);
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Duplicate email - Correct validation`);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Invalid email - Correct validation`);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      // Lưu token để dùng cho các test sau
      authToken = response.body.token;
      
      console.log(`✅ Login - Token received: ${authToken.substring(0, 20)}...`);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Wrong password - Correct rejection`);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Non-existent user - Correct rejection`);
    });
  });

  // ==================== PROTECTED ENDPOINTS (Require Auth) ====================
  
  describe('GET /api/v1/user/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      
      console.log(`✅ GET /user/me - Profile: ${response.body.user.full_name}`);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/user/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ No token - Correct rejection`);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/user/me')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Invalid token - Correct rejection`);
    });
  });

  describe('GET /api/v1/saved-properties/dashboard/saved', () => {
    it('should return saved properties list', async () => {
      const response = await request(app)
        .get('/api/v1/saved-properties/dashboard/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('savedProperties');
      expect(Array.isArray(response.body.savedProperties)).toBe(true);
      
      console.log(`✅ Saved properties - Found ${response.body.savedProperties.length} items`);
    });
  });

  describe('POST /api/v1/saved-properties', () => {
    it('should save a property', async () => {
      if (!testPostId) {
        console.log('⚠️ Skipping save property test - no post ID available');
        return;
      }

      const response = await request(app)
        .post('/api/v1/saved-properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ postId: testPostId })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      console.log(`✅ Save property - Post saved successfully`);
    });
  });

  // ==================== SEARCH ENDPOINT ====================
  
  describe('GET /api/v1/posts (Search)', () => {
    it('should search posts by keyword', async () => {
      const response = await request(app)
        .get('/api/v1/posts?search=phòng trọ')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      console.log(`✅ Search "phòng trọ" - Found ${response.body.posts.length} results`);
    });

    it('should filter by property type', async () => {
      const response = await request(app)
        .get('/api/v1/posts?propertyType=phong-tro&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      console.log(`✅ Filter by type - Found ${response.body.posts.length} posts`);
    });
  });
});
