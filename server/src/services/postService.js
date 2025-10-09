// src/services/postService.js
import { success } from "~/utils/responeHandler.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { LANDLORD_PROJECTION, ROOM_PROJECTION } from "../utils/constants.js";
import notificationService from "./notificationService.js";

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

  async listPosts({
    page = 1,
    limit = 10,
    filters = {},
    sort = { createdAt: -1 },
  }) {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
    ];

    // 🧱 Build match conditions
    const match = {};

    // Status filter
    match.status = filters.status || "active";

    // City filter
    if (filters.city) match["room.city"] = filters.city;

    // Price range
    if (filters.price_min || filters.price_max) {
      match["room.price"] = {};
      if (filters.price_min)
        match["room.price"].$gte = Number(filters.price_min);
      if (filters.price_max)
        match["room.price"].$lte = Number(filters.price_max);
    }

    pipeline.push({ $match: match });
    pipeline.push({ $sort: sort });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // ✅ Query song song để tối ưu
    const [posts, totalResult] = await Promise.all([
      Post.aggregate(pipeline),
      Post.aggregate([
        {
          $lookup: {
            from: "rooms",
            localField: "roomId",
            foreignField: "_id",
            as: "room",
          },
        },
        { $unwind: "$room" },
        { $match: match },
        { $count: "total" },
      ]),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items: posts,
    };
  }

  async getPostById(postId) {
    const post = await Post.findById(postId)
      .populate({ path: "roomId", select: ROOM_PROJECTION })
      .populate("landlord", LANDLORD_PROJECTION);

    if (!post) throw new Error("Post not found");
    return post;
  }

  async updateStatusPost(postId, status) {
    try {
      const post = await Post.findById(postId);
      post.status = status;
      await post.save();
      notificationService.createNotification({
        user: post.landlord,
        title: "Cập nhật trạng thái bài đăng",
        message: `Bài đăng của bạn đã được cập nhật trạng thái thành ${status}.`,
        type: "post_status_update",
        relatedId: post._id,
      });
      return success(true, "Cập nhật trạng thái bài đăng thành công", post);
    } catch (error) {
      throw new Error("Lỗi khi cập nhật trạng thái bài đăng");
    }
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
