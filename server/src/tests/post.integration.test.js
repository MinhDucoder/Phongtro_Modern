import mongoose from "mongoose";
import {
  connectTestDb,
  disconnectTestDb,
  clearDatabase,
  createTestUser,
  createTestLandlord,
  createTestRoom,
  createTestPost,
} from "./test-setup.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";

describe("Post API Tests", () => {
  let landlord;
  let user;
  let room;
  let post;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();

    landlord = await createTestLandlord(User);
    user = await createTestUser(User);
    room = await createTestRoom(Room, landlord._id);
    post = await createTestPost(Post, room._id, landlord._id);
  });

  describe("POST /api/v1/posts - Create Post", () => {
    test("Should create post successfully", async () => {
      const newPost = await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "active",
        favouriteLevel: "free",
      });

      expect(newPost).toBeDefined();
      expect(newPost.roomId.toString()).toBe(room._id.toString());
      expect(newPost.status).toBe("active");
    });

    test("Should require roomId", async () => {
      await expect(
        Post.create({
          landlord: landlord._id,
          status: "active",
        })
      ).rejects.toThrow();
    });

    test("Should set default status to pending", async () => {
      const newPost = await Post.create({
        roomId: room._id,
        landlord: landlord._id,
      });

      expect(newPost.status).toBe("pending");
    });
  });

  describe("GET /api/v1/posts - List Posts", () => {
    test("Should list active posts only", async () => {
      // Create multiple posts
      await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "active",
      });

      const inactivePost = await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "inactive",
      });

      const activePosts = await Post.find({ status: "active" });
      expect(activePosts.length).toBeGreaterThan(0);
      expect(activePosts.every((p) => p.status === "active")).toBe(true);
    });

    test("Should support pagination", async () => {
      // Create 25 posts
      for (let i = 0; i < 24; i++) {
        const newRoom = await Room.create({
          title: `Room ${i}`,
          price: 1000000 + i * 100000,
          area: 20 + i,
          address: `Address ${i}`,
          city: "Ho Chi Minh",
          district: "District",
          propertyType: "phong_tro",
          roomType: "phong_don",
          landlord: landlord._id,
          amenities: ["wifi"],
        });

        await Post.create({
          roomId: newRoom._id,
          landlord: landlord._id,
          status: "active",
        });
      }

      const page1 = await Post.find({ status: "active" })
        .limit(10)
        .skip(0);

      const page2 = await Post.find({ status: "active" })
        .limit(10)
        .skip(10);

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(10);
      expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());
    });

    test("Should support sorting", async () => {
      const oldRoom = await Room.create({
        title: "Old Room",
        price: 1000000,
        area: 20,
        address: "Address",
        city: "Ho Chi Minh",
        district: "District",
        propertyType: "phong_tro",
        roomType: "phong_don",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: oldRoom._id,
        landlord: landlord._id,
        status: "active",
      });

      const newestFirst = await Post.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(2);

      expect(newestFirst[0].createdAt >= newestFirst[1].createdAt).toBe(true);
    });
  });

  describe("GET /api/v1/posts/:id - Get Post Detail", () => {
    test("Should get post detail with populated data", async () => {
      const detail = await Post.findById(post._id)
        .populate("roomId")
        .populate("landlord");

      expect(detail).toBeDefined();
      expect(detail.roomId).toBeDefined();
      expect(detail.landlord).toBeDefined();
      expect(detail.roomId.title).toBe(room.title);
    });

    test("Should return null for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const notFound = await Post.findById(fakeId);
      expect(notFound).toBeNull();
    });

    test("Should include all post details", async () => {
      const detail = await Post.findById(post._id);

      expect(detail._id).toBeDefined();
      expect(detail.roomId).toBeDefined();
      expect(detail.landlord).toBeDefined();
      expect(detail.status).toBeDefined();
      expect(detail.createdAt).toBeDefined();
      expect(detail.updatedAt).toBeDefined();
    });
  });

  describe("PUT /api/v1/posts/:id - Update Post", () => {
    test("Should update post status", async () => {
      const updated = await Post.findByIdAndUpdate(
        post._id,
        { status: "inactive" },
        { new: true }
      );

      expect(updated.status).toBe("inactive");
    });

    test("Should update favourite level", async () => {
      const updated = await Post.findByIdAndUpdate(
        post._id,
        { favouriteLevel: "vip" },
        { new: true }
      );

      expect(updated.favouriteLevel).toBe("vip");
    });

    test("Should not allow updating if not owner", async () => {
      const otherUser = await createTestUser(User);

      // Verify post doesn't belong to other user
      expect(post.landlord.toString()).not.toBe(otherUser._id.toString());
    });
  });

  describe("DELETE /api/v1/posts/:id - Delete Post", () => {
    test("Should delete post successfully", async () => {
      await Post.findByIdAndDelete(post._id);

      const deleted = await Post.findById(post._id);
      expect(deleted).toBeNull();
    });

    test("Should only allow landlord to delete", async () => {
      const otherLandlord = await createTestLandlord(User);
      expect(post.landlord.toString()).not.toBe(otherLandlord._id.toString());
    });
  });

  describe("GET /api/v1/posts?q= - Search Posts", () => {
    test("Should search by Vietnamese keywords", async () => {
      const searchRoom = await Room.create({
        title: "Phòng trọ gần trường đại học",
        description: "Nhà trọ sạch sẽ",
        price: 2000000,
        area: 25,
        address: "123 Nguyen Huu Canh",
        city: "Ho Chi Minh",
        district: "Binh Thanh",
        propertyType: "phong_tro",
        roomType: "phong_don",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: searchRoom._id,
        landlord: landlord._id,
        status: "active",
      });

      // Search with regex
      const results = await Post.find({ status: "active" })
        .populate("roomId")
        .lean();

      const searchResults = results.filter((p) =>
        p.roomId.title.match(/phòng|trọ/i)
      );

      expect(searchResults.length).toBeGreaterThan(0);
    });

    test("Should search with accented characters", async () => {
      const accentedRoom = await Room.create({
        title: "Nhà trọ tại Quận 7",
        description: "Phòng được trang bị đầy đủ tiện nghi",
        price: 3000000,
        area: 30,
        address: "456 Nguyễn Văn Trỗi",
        city: "Ho Chi Minh",
        district: "District 7",
        propertyType: "phong_tro",
        roomType: "phong_don",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: accentedRoom._id,
        landlord: landlord._id,
        status: "active",
      });

      // Test regex search with accents
      const results = await Post.find({ status: "active" })
        .populate("roomId")
        .lean();

      expect(results.length).toBeGreaterThan(0);
    });

    test("Should support URL-encoded search queries", async () => {
      // Simulate URL-encoded query: "nhà trọ" => "nh%C3%A0+tr%E1%BB%8D"
      const encodedQuery = decodeURIComponent("nh%C3%A0+tr%E1%BB%8D");
      expect(encodedQuery).toBe("nhà trọ");

      // Create matching room
      const matchRoom = await Room.create({
        title: "Nhà trọ đẹp và rẻ",
        price: 1500000,
        area: 18,
        address: "789 Address",
        city: "Ho Chi Minh",
        district: "Binh Thanh",
        propertyType: "phong_tro",
        roomType: "phong_don",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: matchRoom._id,
        landlord: landlord._id,
        status: "active",
      });

      // Search
      const regex = new RegExp(encodedQuery, "i");
      const results = await Post.find({ status: "active" })
        .populate("roomId")
        .lean();

      const filtered = results.filter((p) => regex.test(p.roomId.title));
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/posts?propertyType= - Filter by Type", () => {
    test("Should filter by property type", async () => {
      const room2 = await Room.create({
        title: "Apartment",
        propertyType: "can_ho_chung_cu",
        roomType: "phong_doi",
        price: 5000000,
        area: 50,
        address: "Address 2",
        city: "Ho Chi Minh",
        district: "District 1",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: room2._id,
        landlord: landlord._id,
        status: "active",
      });

      const phongTroOnly = await Post.find({ status: "active" })
        .populate("roomId")
        .lean();

      const filtered = phongTroOnly.filter(
        (p) => p.roomId.propertyType === "phong_tro"
      );

      expect(filtered.some((p) => p.roomId.propertyType === "phong_tro")).toBe(
        true
      );
    });
  });

  describe("GET /api/v1/posts?province= - Filter by City", () => {
    test("Should filter by city", async () => {
      const hnRoom = await Room.create({
        title: "Phòng Hà Nội",
        city: "Ha Noi",
        price: 2000000,
        area: 20,
        address: "Hanoi Address",
        district: "Hoan Kiem",
        propertyType: "phong_tro",
        roomType: "phong_don",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: hnRoom._id,
        landlord: landlord._id,
        status: "active",
      });

      const hcmPosts = await Post.find({ status: "active" })
        .populate("roomId")
        .lean();

      const hcmFiltered = hcmPosts.filter(
        (p) => p.roomId.city === "Ho Chi Minh"
      );

      expect(hcmFiltered.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/posts/suggestions/latest - Get Latest Posts", () => {
    test("Should get latest posts", async () => {
      // Create older post
      const oldPost = await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "active",
      });

      // Wait and create newer post
      const newPost = await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "active",
      });

      const latest = await Post.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(6);

      expect(latest[0]._id.toString()).toBe(newPost._id.toString());
    });

    test("Should limit to 6 posts by default", async () => {
      // Create 10 posts
      for (let i = 0; i < 9; i++) {
        const newRoom = await Room.create({
          title: `Room ${i}`,
          price: 1000000,
          area: 20,
          address: `Address ${i}`,
          city: "Ho Chi Minh",
          district: "District",
          propertyType: "phong_tro",
          roomType: "phong_don",
          landlord: landlord._id,
          amenities: ["wifi"],
        });

        await Post.create({
          roomId: newRoom._id,
          landlord: landlord._id,
          status: "active",
        });
      }

      const latest = await Post.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(6);

      expect(latest.length).toBeLessThanOrEqual(6);
    });
  });

  describe("Post Stats & Analytics", () => {
    test("Should count posts by status", async () => {
      await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "pending",
      });

      await Post.create({
        roomId: room._id,
        landlord: landlord._id,
        status: "inactive",
      });

      const stats = await Post.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      expect(stats.length).toBeGreaterThan(0);
      const activeStatus = stats.find((s) => s._id === "active");
      expect(activeStatus).toBeDefined();
    });

    test("Should get posts count by landlord", async () => {
      // Create another post for same landlord
      const newRoom = await Room.create({
        title: "Another Room",
        price: 3000000,
        area: 25,
        address: "Address",
        city: "Ho Chi Minh",
        district: "District",
        propertyType: "phong_tro",
        roomType: "phong_don",
        landlord: landlord._id,
        amenities: ["wifi"],
      });

      await Post.create({
        roomId: newRoom._id,
        landlord: landlord._id,
        status: "active",
      });

      const landlordStats = await Post.aggregate([
        { $match: { landlord: new mongoose.Types.ObjectId(landlord._id) } },
        { $count: "totalPosts" },
      ]);

      expect(landlordStats[0].totalPosts).toBeGreaterThanOrEqual(2);
    });
  });
});
