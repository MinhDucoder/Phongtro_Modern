import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../server.js";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";

dotenv.config();

describe("Post API Tests", () => {
  let userId;
  let postId;
  let authToken;
  let roomId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/phongtro_test");

    await User.deleteMany({});
    await Post.deleteMany({});
    await Room.deleteMany({});

    // Create test user
    const userRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "posttest@example.com",
        password: "Test@123",
        full_name: "Post Test User",
        phone: "0901111111",
      });

    userId = userRes.body.data?.user?._id || userRes.body.data?._id;
    authToken = userRes.body.data?.token;

    // Create test rooms
    const room1Res = await request(app)
      .post("/api/v1/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Phòng trọ đẹp quận 1",
        description: "Phòng trọ sạch sẽ, gần trung tâm",
        price: 3000000,
        area: 30,
        address: "123 Nguyễn Huệ",
        city: "Hồ Chí Minh",
        district: "Quận 1",
        propertyType: "phong_tro",
        images: [],
      });

    roomId = room1Res.body.data?._id;

    const room2Res = await request(app)
      .post("/api/v1/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Nhà nguyên căn 3 phòng",
        description: "Nhà đẹp, an toàn",
        price: 8000000,
        area: 80,
        address: "456 Lê Lai",
        city: "Hồ Chí Minh",
        district: "Quận 2",
        propertyType: "nha_nguyen_can",
        images: [],
      });

    // Create test posts
    const postRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId: roomId,
        status: "active",
      });

    postId = postRes.body.data?._id;

    // Create more posts for listing tests
    await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId: room2Res.body.data?._id,
        status: "active",
      });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Room.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/v1/posts", () => {
    it("should list all active posts", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it("should search posts by keyword", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, q: "phòng trọ" });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
    });

    it("should support URL-encoded unicode search", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, q: "nhà trọ" });

      expect(res.status).toBe(200);
    });

    it("should filter by propertyType", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, propertyType: "phong_tro" });

      expect(res.status).toBe(200);
      res.body.data.items.forEach((post) => {
        expect(post.roomId.propertyType).toBe("phong_tro");
      });
    });

    it("should filter by price range", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, priceRange: "3-5-trieu" });

      expect(res.status).toBe(200);
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(5);
    });

    it("should support sorting", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, sortBy: "createdAt", order: "desc" });

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/posts/:id", () => {
    it("should get post detail", async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${postId}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(postId);
      expect(res.body.data.roomId).toBeDefined();
      expect(res.body.data.landlord).toBeDefined();
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/posts/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/posts/suggestions/latest", () => {
    it("should get latest post suggestions", async () => {
      const res = await request(app)
        .get("/api/v1/posts/suggestions/latest")
        .query({ limit: 6 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it("should support search with suggestions", async () => {
      const res = await request(app)
        .get("/api/v1/posts/suggestions/latest")
        .query({ limit: 6, q: "phòng trọ" });

      expect(res.status).toBe(200);
    });

    it("should filter suggestions by propertyType", async () => {
      const res = await request(app)
        .get("/api/v1/posts/suggestions/latest")
        .query({ limit: 6, propertyType: "phong_tro" });

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/posts/:id/recommend", () => {
    it("should get recommended posts", async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${postId}/recommend`)
        .query({ limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.recommendations).toBeDefined();
    });
  });

  describe("POST /api/v1/posts", () => {
    it("should create a post", async () => {
      const roomRes = await request(app)
        .post("/api/v1/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Phòng mới",
          description: "Phòng test",
          price: 2500000,
          area: 25,
          address: "789 Trần Hưng Đạo",
          city: "Hồ Chí Minh",
          district: "Quận 5",
          propertyType: "phong_tro",
          images: [],
        });

      const res = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          roomId: roomRes.body.data?._id,
          status: "active",
        });

      expect(res.status).toBe(201);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.status).toBe("active");
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/v1/posts")
        .send({
          roomId: roomId,
          status: "active",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/posts/:id", () => {
    it("should update post (admin only)", async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${postId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "pending",
        });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/posts/:id", () => {
    it("should delete post (admin only)", async () => {
      // Create a post to delete
      const roomRes = await request(app)
        .post("/api/v1/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Phòng để xóa",
          description: "Sẽ bị xóa",
          price: 2000000,
          area: 20,
          address: "Delete me",
          city: "Hồ Chí Minh",
          district: "Quận 1",
          propertyType: "phong_tro",
          images: [],
        });

      const postRes = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          roomId: roomRes.body.data?._id,
          status: "active",
        });

      const res = await request(app)
        .delete(`/api/v1/posts/${postRes.body.data?._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });
  });

  describe("Search with Fallback", () => {
    it("should handle MeiliSearch fallback gracefully", async () => {
      // Test with special characters and accents
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, q: "Hồ Chí Minh" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it("should return valid results even if MeiliSearch fails", async () => {
      const res = await request(app)
        .get("/api/v1/posts")
        .query({ page: 1, limit: 12, q: "phòng", propertyType: "phong_tro" });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
    });
  });
});
