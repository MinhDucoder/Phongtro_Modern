// tests/stats.test.js
import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('Stats API Tests', () => {
  beforeAll(async () => {
    // Kết nối test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_test');
  });

  afterAll(async () => {
    // Đóng kết nối
    await mongoose.connection.close();
  });

  describe('GET /api/v1/stats/overview', () => {
    it('should return overview statistics', async () => {
      const response = await request(app)
        .get('/api/v1/stats/overview')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPosts');
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalRooms');
      expect(response.body.data).toHaveProperty('activePosts');
      expect(response.body.data).toHaveProperty('newPostsToday');
      expect(response.body.data).toHaveProperty('totalViews');
      expect(response.body.data).toHaveProperty('lastUpdated');
    });

    it('should return cached data on second request', async () => {
      const response = await request(app)
        .get('/api/v1/stats/overview')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cached).toBe(true);
    });
  });

  describe('GET /api/v1/stats/real-time', () => {
    it('should return real-time statistics', async () => {
      const response = await request(app)
        .get('/api/v1/stats/real-time')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('onlineUsers');
      expect(response.body.data).toHaveProperty('postsLastHour');
      expect(response.body.data).toHaveProperty('postsLastDay');
      expect(response.body.data).toHaveProperty('viewsLastHour');
      expect(response.body.data).toHaveProperty('viewsLastDay');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/stats/trending', () => {
    it('should return trending statistics with default parameters', async () => {
      const response = await request(app)
        .get('/api/v1/stats/trending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cityTrends');
      expect(response.body.data).toHaveProperty('propertyTypeTrends');
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('startDate');
      expect(response.body.data).toHaveProperty('endDate');
    });

    it('should return trending statistics with custom parameters', async () => {
      const response = await request(app)
        .get('/api/v1/stats/trending?period=30d&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('30d');
    });
  });

  describe('GET /api/v1/stats/cities', () => {
    it('should return city statistics', async () => {
      const response = await request(app)
        .get('/api/v1/stats/cities')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/stats/property-types', () => {
    it('should return property type statistics', async () => {
      const response = await request(app)
        .get('/api/v1/stats/property-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/stats/prices', () => {
    it('should return price statistics', async () => {
      const response = await request(app)
        .get('/api/v1/stats/prices')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('avgPrice');
      expect(response.body.data).toHaveProperty('minPrice');
      expect(response.body.data).toHaveProperty('maxPrice');
    });

    it('should return price statistics with filters', async () => {
      const response = await request(app)
        .get('/api/v1/stats/prices?city=Hà Nội&propertyType=phong-tro')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/stats/users', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/stats/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/stats/trending?period=invalid')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});


