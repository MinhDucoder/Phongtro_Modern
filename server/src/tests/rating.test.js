import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../server.js";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import Rating from "../models/ratingSchema.js";

dotenv.config();

describe("Rating API Tests", () => {
  let userId;
  let postId;
  let authToken;
  let landlordId;
  let landlordToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/phongtro_test");

    // Clean up collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Room.deleteMany({});
    await Rating.deleteMany({});

    // Create test users
    const userRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "testuser@example.com",
        password: "Test@123",
        full_name: "Test User",
        phone: "0901234567",
      });

    userId = userRes.body.data?.user?._id || userRes.body.data?._id;
    authToken = userRes.body.data?.token || userRes.headers["set-cookie"];

    // Create landlord user
    const landlordRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "landlord@example.com",
        password: "Test@123",
        full_name: "Landlord User",
        phone: "0912345678",
      });

    landlordId = landlordRes.body.data?.user?._id || landlordRes.body.data?._id;
    landlordToken = landlordRes.body.data?.token || landlordRes.headers["set-cookie"];

    // Create a room
    const roomRes = await request(app)
      .post("/api/v1/rooms")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        title: "Phòng trọ đẹp",
        description: "Phòng trọ sạch sẽ, an toàn",
        price: 3000000,
        area: 30,
        address: "123 Nguyễn Huệ",
        city: "Hồ Chí Minh",
        district: "Quận 1",
        propertyType: "phong_tro",
        images: [],
      });

    const roomId = roomRes.body.data?._id;

    // Create a post
    const postRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        roomId: roomId,
        status: "active",
      });

    postId = postRes.body.data?._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Room.deleteMany({});
    await Rating.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /api/v1/posts/:id/rating", () => {
    it("should create a rating successfully", async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: "Phòng rất đẹp, sạch sẽ!",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe("Phòng rất đẹp, sạch sẽ!");
    });

    it("should reject rating < 1 or > 5", async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 6,
          comment: "Invalid rating",
        });

      expect(res.status).toBe(400);
    });

    it("landlord should not rate own post", async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${landlordToken}`)
        .send({
          rating: 5,
          comment: "My own post",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Landlord cannot rate own post");
    });

    it("should update rating if user already rated", async () => {
      // First rating
      await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 4,
          comment: "Good",
        });

      // Update rating
      const res = await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: "Very good!",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe("Very good!");
    });
  });

  describe("GET /api/v1/posts/:id/ratings", () => {
    it("should list all ratings for a post", async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${postId}/ratings`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter ratings by star", async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${postId}/ratings`)
        .query({ page: 1, limit: 10, star: 5 });

      expect(res.status).toBe(200);
      res.body.data.forEach((rating) => {
        expect(rating.rating).toBe(5);
      });
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${postId}/ratings`)
        .query({ page: 1, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe("DELETE /api/v1/posts/:id/rating", () => {
    it("should delete user's own rating", async () => {
      // Create a rating first
      await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 3,
          comment: "Average",
        });

      // Delete it
      const res = await request(app)
        .delete(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Rating deleted");
    });

    it("should require authentication to delete", async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${postId}/rating`);

      expect(res.status).toBe(401);
    });
  });

  describe("Post averageRating calculation", () => {
    it("should update post averageRating after rating", async () => {
      // Add multiple ratings
      await request(app)
        .post(`/api/v1/posts/${postId}/rating`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ rating: 5, comment: "Great!" });

      // Check post averageRating
      const postRes = await request(app)
        .get(`/api/v1/posts/${postId}`);

      expect(postRes.body.data.averageRating).toBeDefined();
      expect(postRes.body.data.totalRatings).toBeGreaterThan(0);
    });
  });
});
