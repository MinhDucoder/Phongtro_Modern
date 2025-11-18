import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../server.js";
import User from "../models/userSchema.js";

dotenv.config();

describe("Auth API Tests", () => {
  const testUser = {
    email: "testauth@example.com",
    password: "TestPassword@123",
    full_name: "Auth Test User",
    phone: "0901234567",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/phongtro_test");
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
    });

    it("should fail if email already exists", async () => {
      // Register first user
      await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      // Try to register with same email
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...testUser,
          full_name: "Another User",
        });

      expect(res.status).toBe(400);
    });

    it("should fail if email is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email",
          password: "TestPassword@123",
          full_name: "Test User",
          phone: "0901234567",
        });

      expect(res.status).toBe(400);
    });

    it("should fail if password is weak", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "weak@example.com",
          password: "123", // Too weak
          full_name: "Test User",
          phone: "0901234567",
        });

      expect(res.status).toBe(400);
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "incomplete@example.com",
          // Missing password, full_name, phone
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeAll(async () => {
      // Register a user first
      await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);
    });

    it("should login with correct credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it("should fail with incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword@123",
        });

      expect(res.status).toBe(401);
    });

    it("should fail if user does not exist", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SomePassword@123",
        });

      expect(res.status).toBe(401);
    });

    it("should fail if email or password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          // Missing password
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...testUser,
          email: "logout@example.com",
        });

      authToken = res.body.data.token;
    });

    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let authToken;
    let userId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...testUser,
          email: "profile@example.com",
        });

      authToken = res.body.data.token;
      userId = res.body.data.user._id;
    });

    it("should get current user profile", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(userId);
      expect(res.body.data.email).toBe("profile@example.com");
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me");

      expect(res.status).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid_token_123");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    let refreshToken;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...testUser,
          email: "refresh@example.com",
        });

      refreshToken = res.body.data.refreshToken;
    });

    it("should refresh access token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({
          refreshToken: refreshToken,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("should fail with invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({
          refreshToken: "invalid_refresh_token",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should send password reset email", async () => {
      // Register a user first
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...testUser,
          email: "forgot@example.com",
        });

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "forgot@example.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("reset");
    });

    it("should handle non-existent email gracefully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "notfound@example.com",
        });

      // Should return 200 for security (don't leak user existence)
      expect(res.status).toBe(200);
    });
  });
});
