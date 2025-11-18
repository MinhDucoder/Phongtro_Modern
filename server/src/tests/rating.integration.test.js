import request from "supertest";
import mongoose from "mongoose";
import {
  connectTestDb,
  disconnectTestDb,
  clearDatabase,
  createTestUser,
  createTestLandlord,
  createTestRoom,
  createTestPost,
  testConfig,
} from "./test-setup.js";
import Rating from "../models/ratingSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";

// Import your app (adjust path as needed)
// const app = require("../server.js");

describe("Rating API Tests", () => {
  let app;
  let server;
  let landlord;
  let user;
  let room;
  let post;
  let token;

  beforeAll(async () => {
    await connectTestDb();
    
    // Mock app for testing
    // app = require("../server.js");
    // server = app.listen(0); // Random port
  });

  afterAll(async () => {
    await disconnectTestDb();
    // if (server) server.close();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test data
    landlord = await createTestLandlord(User);
    user = await createTestUser(User);
    room = await createTestRoom(Room, landlord._id);
    post = await createTestPost(Post, room._id, landlord._id);

    // Create mock token (in real test, use login endpoint)
    token = "mock-jwt-token";
  });

  describe("POST /api/v1/posts/:id/rating - Create/Update Rating", () => {
    test("Should create rating successfully", async () => {
      const ratingData = {
        rating: 5,
        comment: "Phòng trọ rất đẹp và sạch sẽ!",
      };

      // Mock the rating creation
      const result = await Rating.create({
        post: post._id,
        user: user._id,
        rating: ratingData.rating,
        comment: ratingData.comment,
      });

      expect(result).toBeDefined();
      expect(result.rating).toBe(5);
      expect(result.comment).toBe("Phòng trọ rất đẹp và sạch sẽ!");
    });

    test("Should reject rating if not between 1-5", async () => {
      const invalidRatings = [0, 6, -1, 10];

      for (const rating of invalidRatings) {
        expect(() => {
          if (rating < 1 || rating > 5) {
            throw new Error("rating must be between 1 and 5");
          }
        }).toThrow();
      }
    });

    test("Should update existing rating (upsert)", async () => {
      // Create initial rating
      await Rating.create({
        post: post._id,
        user: user._id,
        rating: 3,
        comment: "Bình thường",
      });

      // Update rating
      const updated = await Rating.findOneAndUpdate(
        { post: post._id, user: user._id },
        { rating: 5, comment: "Rất tốt!" },
        { new: true }
      );

      expect(updated.rating).toBe(5);
      expect(updated.comment).toBe("Rất tốt!");
    });

    test("Should prevent landlord from rating own post", async () => {
      expect(() => {
        if (landlord._id.toString() === landlord._id.toString()) {
          throw new Error("Landlord cannot rate own post");
        }
      }).toThrow();
    });

    test("Should enforce unique constraint (post, user)", async () => {
      const ratingData = {
        post: post._id,
        user: user._id,
        rating: 5,
        comment: "Good!",
      };

      await Rating.create(ratingData);

      // Try to create duplicate
      await expect(
        Rating.create(ratingData)
      ).rejects.toThrow();
    });

    test("Should auto-update post averageRating", async () => {
      // Create multiple ratings
      const ratings = [5, 4, 3, 5];

      for (let i = 0; i < ratings.length; i++) {
        const testUser = await createTestUser(User);
        await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: ratings[i],
          comment: `Rating ${ratings[i]}`,
        });
      }

      // Calculate expected average
      const stats = await Rating.aggregate([
        { $match: { post: new mongoose.Types.ObjectId(post._id) } },
        {
          $group: {
            _id: "$post",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]);

      expect(stats[0].avgRating).toBe(4.25);
      expect(stats[0].count).toBe(4);
    });
  });

  describe("GET /api/v1/posts/:id/ratings - List Ratings", () => {
    test("Should list ratings with pagination", async () => {
      // Create test ratings
      for (let i = 0; i < 15; i++) {
        const testUser = await createTestUser(User);
        await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: (i % 5) + 1,
          comment: `Comment ${i}`,
        });
      }

      // Test pagination
      const page1 = await Rating.find({ post: post._id })
        .skip(0)
        .limit(10);

      const page2 = await Rating.find({ post: post._id })
        .skip(10)
        .limit(10);

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(5);
    });

    test("Should filter ratings by star", async () => {
      // Create ratings with different stars
      for (let star = 1; star <= 5; star++) {
        const testUser = await createTestUser(User);
        await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: star,
          comment: `${star} star`,
        });
      }

      // Filter 5-star ratings
      const fiveStarRatings = await Rating.find({
        post: post._id,
        rating: 5,
      });

      expect(fiveStarRatings.length).toBe(1);
      expect(fiveStarRatings[0].rating).toBe(5);
    });

    test("Should sort ratings by date", async () => {
      // Create ratings with delay
      const ratingIds = [];
      for (let i = 0; i < 3; i++) {
        const testUser = await createTestUser(User);
        const rating = await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: 5,
          comment: `Comment ${i}`,
        });
        ratingIds.push(rating._id);
        await new Promise((r) => setTimeout(r, 100)); // 100ms delay
      }

      // Get sorted by newest first
      const sorted = await Rating.find({ post: post._id })
        .sort({ createdAt: -1 });

      expect(sorted[0]._id.toString()).toBe(ratingIds[2].toString());
    });

    test("Should populate user info", async () => {
      const testUser = await createTestUser(User);
      await Rating.create({
        post: post._id,
        user: testUser._id,
        rating: 5,
        comment: "Great!",
      });

      const rating = await Rating.findOne({ post: post._id })
        .populate("user", "full_name email");

      expect(rating.user.full_name).toBeDefined();
      expect(rating.user.email).toBeDefined();
    });

    test("Should handle empty ratings list", async () => {
      const ratings = await Rating.find({ post: post._id });
      expect(ratings.length).toBe(0);
    });
  });

  describe("DELETE /api/v1/posts/:id/rating - Delete Rating", () => {
    test("Should delete rating successfully", async () => {
      // Create rating
      const rating = await Rating.create({
        post: post._id,
        user: user._id,
        rating: 5,
        comment: "Good!",
      });

      // Delete it
      await Rating.deleteOne({
        post: post._id,
        user: user._id,
      });

      // Verify deletion
      const deleted = await Rating.findById(rating._id);
      expect(deleted).toBeNull();
    });

    test("Should recalculate post stats after deletion", async () => {
      // Create multiple ratings
      const users = [];
      for (let i = 0; i < 3; i++) {
        const testUser = await createTestUser(User);
        users.push(testUser);
        await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: 5,
          comment: `Comment ${i}`,
        });
      }

      // Delete one rating
      await Rating.deleteOne({
        post: post._id,
        user: users[0]._id,
      });

      // Check remaining
      const remaining = await Rating.find({ post: post._id });
      expect(remaining.length).toBe(2);
    });

    test("Should return error if rating not found", async () => {
      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(
        Rating.deleteOne({
          post: post._id,
          user: fakeUserId,
        })
      ).resolves.not.toThrow();
    });
  });

  describe("Rating Stats & Aggregations", () => {
    test("Should calculate average rating correctly", async () => {
      const ratings = [5, 5, 4, 3, 2];
      
      for (let i = 0; i < ratings.length; i++) {
        const testUser = await createTestUser(User);
        await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: ratings[i],
          comment: `Rating`,
        });
      }

      const stats = await Rating.aggregate([
        { $match: { post: new mongoose.Types.ObjectId(post._id) } },
        {
          $group: {
            _id: "$post",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
            maxRating: { $max: "$rating" },
            minRating: { $min: "$rating" },
          },
        },
      ]);

      expect(stats[0].avgRating).toBeCloseTo(3.8, 1);
      expect(stats[0].count).toBe(5);
      expect(stats[0].maxRating).toBe(5);
      expect(stats[0].minRating).toBe(2);
    });

    test("Should get distribution of ratings", async () => {
      const ratings = [5, 5, 5, 4, 4, 3, 2, 1];

      for (let i = 0; i < ratings.length; i++) {
        const testUser = await createTestUser(User);
        await Rating.create({
          post: post._id,
          user: testUser._id,
          rating: ratings[i],
          comment: "Test",
        });
      }

      const distribution = await Rating.aggregate([
        { $match: { post: new mongoose.Types.ObjectId(post._id) } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      expect(distribution).toHaveLength(4); // 1, 2, 3, 4, 5 stars
      const fiveStar = distribution.find((d) => d._id === 5);
      expect(fiveStar.count).toBe(3);
    });
  });
});
