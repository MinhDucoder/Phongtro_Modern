// src/services/postService.js
import mongoose from "mongoose";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { LANDLORD_PROJECTION, ROOM_PROJECTION } from "../utils/constants.js";

class PostService {
  async createPost(userId, { roomId, options, favouriteLevel }) {
    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");
    if (String(room.landlord) !== String(userId)) {
      throw new Error("Not your room");
    }

    const post = await Post.create({
      roomId,
      landlord: userId,
      options,
      favouriteLevel,
    });

    return post.populate([
      { path: "roomId", select: ROOM_PROJECTION },
      { path: "landlord", select: LANDLORD_PROJECTION },
    ]);
  }

  async listPosts({ page = 1, limit = 20, filters = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const posts = await Post.find(filters)
      .populate({ path: "roomId", select: ROOM_PROJECTION })
      .populate("landlord", LANDLORD_PROJECTION)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Post.countDocuments(filters);

    return { total, items: posts };
  }

  async getPostById(postId) {
    const post = await Post.findById(postId)
      .populate({ path: "roomId", select: ROOM_PROJECTION })
      .populate("landlord", LANDLORD_PROJECTION);

    if (!post) throw new Error("Post not found");

    const room = post.roomId;
    const landlord = post.landlord;

    // Aggregate analytics data for the post
    const analyticsAggregate = await PostAnalytics.aggregate([
      {
        $match: {
          post: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $group: {
          _id: "$post",
          views: { $sum: "$metrics.views" },
          likes: { $sum: "$metrics.likes" },
          calls: { $sum: "$metrics.calls" },
          messages: { $sum: "$metrics.messages" },
        },
      },
    ]);

    const analyticsSummary = analyticsAggregate[0] || {
      views: 0,
      likes: 0,
      calls: 0,
      messages: 0,
    };

    return {
      id: post._id,
      _id: post._id,
      status: post.status,
      favouriteLevel: post.favouriteLevel,
      options: post.options,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      analytics: analyticsSummary,
      room: {
        id: room?._id,
        _id: room?._id,
        title: room?.title,
        description: room?.description,
        price: room?.price,
        area: room?.area,
        address: room?.address,
        city: room?.city,
        images: room?.images || [],
        amenities: room?.amenities || [],
      },
      landlord: landlord
        ? {
            id: landlord._id,
            _id: landlord._id,
            full_name: landlord.full_name,
            phone: landlord.phone,
            email: landlord.email,
            role: landlord.role,
          }
        : null,
      contact: landlord
        ? {
            name: landlord.full_name,
            phone: landlord.phone,
            email: landlord.email,
            isVerified: landlord.role === 'landlord',
          }
        : null,
      viewCount: analyticsSummary.views,
    };
  }

  async updatePost(postId, userId, { options, favouriteLevel, status }) {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    if (String(post.landlord) !== String(userId)) {
      throw new Error("Not your post");
    }

    if (options) post.options = options;
    if (favouriteLevel) post.favouriteLevel = favouriteLevel;
    if (status) post.status = status;

    await post.save();

    return post.populate([
      { path: "roomId", select: ROOM_PROJECTION },
      { path: "landlord", select: LANDLORD_PROJECTION },
    ]);
  }

  async deletePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    if (String(post.landlord) !== String(userId)) {
      throw new Error("Not your post");
    }

    await Post.findByIdAndDelete(postId);
    return true;
  }
}

export default new PostService();
