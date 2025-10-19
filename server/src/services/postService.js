// src/services/postService.js
import mongoose from "mongoose";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import Subscription from "../models/subscriptionSchema.js";
import { LANDLORD_PROJECTION, ROOM_PROJECTION } from "../utils/constants.js";

class PostService {
  async createPost(userId, postData) {
    console.log('=== CREATE POST SERVICE ===');
    console.log('User ID:', userId);
    console.log('Post Data:', postData);
    
    // Kiểm tra subscription trước khi tạo post
    const subscription = await Subscription.findOne({
      user: userId,
      status: "active",
      endDate: { $gt: new Date() }
    }).populate('packagePlan'); // Populate để lấy postDuration

    if (!subscription) {
      throw new Error("SUBSCRIPTION_REQUIRED:Bạn cần có gói đăng tin để tạo bài đăng. Vui lòng chọn gói phù hợp.");
    }

    // Kiểm tra đã sử dụng hết lượt chưa
    if (subscription.usedPosts >= subscription.postLimit) {
      throw new Error(`LIMIT_EXCEEDED:Bạn đã sử dụng hết ${subscription.postLimit} lượt đăng tin của gói ${subscription.packageName}. Vui lòng nâng cấp gói để tiếp tục đăng tin.`);
    }

    let roomId = postData.roomId;
    
    // Nếu có data room, tạo room mới
    if (postData.room && !roomId) {
      console.log('Creating new room...');
      const roomData = {
        ...postData.room,
        landlord: userId,
      };
      
      const newRoom = await Room.create(roomData);
      console.log('Room created:', newRoom._id);
      roomId = newRoom._id;
    }
    
    if (!roomId) {
      throw new Error("Room ID is required");
    }

    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");
    if (String(room.landlord) !== String(userId)) {
      throw new Error("Not your room");
    }

    // Tính toán ngày hết hạn dựa trên subscription
    // Ưu tiên dùng packagePlan.postDuration nếu có populate, fallback sang subscription.duration
    const postDuration = subscription.packagePlan?.postDuration || subscription.duration || 30; // Mặc định 30 ngày
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + postDuration);

    const post = await Post.create({
      roomId,
      landlord: userId,
      options: postData.options || [],
      favouriteLevel: postData.favouriteLevel || 'free',
      status: postData.status || 'pending',
      expiresAt: expiresAt,
      postDuration: postDuration,
      canExtend: subscription.packagePlan?.allowExtension !== false, // Mặc định true nếu không có packagePlan
    });

    // Cập nhật số lượt đã sử dụng
    await Subscription.findByIdAndUpdate(subscription._id, {
      $inc: { usedPosts: 1 }
    });

    console.log('Post created successfully:', post._id);
    console.log('Post expires at:', expiresAt);
    console.log('Subscription updated - used posts:', subscription.usedPosts + 1);

    return post.populate([
      { path: "roomId", select: ROOM_PROJECTION },
      { path: "landlord", select: LANDLORD_PROJECTION },
    ]);
  }

  async getUserSubscriptionInfo(userId) {
    const subscription = await Subscription.findOne({
      user: userId,
      status: "active",
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      return {
        hasActiveSubscription: false,
        message: "Không có gói đăng tin nào đang hoạt động"
      };
    }

    const remainingPosts = subscription.postLimit - subscription.usedPosts;
    
    return {
      hasActiveSubscription: true,
      subscription: {
        packageName: subscription.packageName,
        packageType: subscription.packageType,
        postLimit: subscription.postLimit,
        usedPosts: subscription.usedPosts,
        remainingPosts: remainingPosts,
        endDate: subscription.endDate,
        isExpired: subscription.endDate <= new Date(),
        canCreatePost: remainingPosts > 0 && subscription.endDate > new Date()
      }
    };
  }

  async listPosts({ page = 1, limit = 20, filters = {}, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    // Nếu có filter propertyType, lọc bằng aggregation pipeline
    let pipeline = [];
    let propertyTypeFilter = null;
    let provinceFilter = null;
    let districtFilter = null;
    let keywordFilter = null;
    
    // Extract special filters
    if (filters["roomId.propertyType"]) {
      propertyTypeFilter = filters["roomId.propertyType"];
      delete filters["roomId.propertyType"];
    }
    
    if (filters["roomId.city"]) {
      provinceFilter = filters["roomId.city"];
      delete filters["roomId.city"];
    }
    
    if (filters["roomId.district"]) {
      districtFilter = filters["roomId.district"];
      delete filters["roomId.district"];
    }
    
    if (filters["roomId.title"]) {
      keywordFilter = filters["roomId.title"];
      delete filters["roomId.title"];
    }
    
    // Match stage - filter theo Post fields
    const matchStage = { $match: filters };
    pipeline.push(matchStage);
    
    // Lookup (populate) roomId
    pipeline.push({
      $lookup: {
        from: "rooms",
        localField: "roomId",
        foreignField: "_id",
        as: "roomId"
      }
    });
    
    // Unwind roomId (convert array to single object)
    pipeline.push({ $unwind: "$roomId" });
    
    // Filter by propertyType if specified
    if (propertyTypeFilter) {
      pipeline.push({
        $match: { "roomId.propertyType": propertyTypeFilter }
      });
    }
    
    // Filter by province/city if specified
    if (provinceFilter) {
      pipeline.push({
        $match: { "roomId.city": provinceFilter }
      });
    }
    
    // Filter by district if specified
    if (districtFilter) {
      pipeline.push({
        $match: { "roomId.district": districtFilter }
      });
    }
    
    // Filter by keyword if specified
    if (keywordFilter) {
      pipeline.push({
        $match: { "roomId.title": keywordFilter }
      });
    }
    
    // Lookup landlord
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "landlord",
        foreignField: "_id",
        as: "landlord"
      }
    });
    
    // Unwind landlord
    pipeline.push({ $unwind: { path: "$landlord", preserveNullAndEmptyArrays: true } });
    
    // Sort stage
    const sortStage = { $sort: sort };
    pipeline.push(sortStage);
    
    // Facet to get both total count and paginated results
    pipeline.push({
      $facet: {
        totalCount: [{ $count: "count" }],
        items: [{ $skip: skip }, { $limit: limit }]
      }
    });
    
    const result = await Post.aggregate(pipeline);
    
    const total = result[0]?.totalCount[0]?.count || 0;
    const posts = result[0]?.items || [];

    // Transform data để có cấu trúc rõ ràng hơn
    const transformedPosts = posts.map(post => {
      const room = post.roomId;
      const landlord = post.landlord;
      
      return {
        id: post._id,
        _id: post._id,
        status: post.status,
        favouriteLevel: post.favouriteLevel,
        options: post.options || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        roomId: room ? {
          id: room._id,
          _id: room._id,
          title: room.title,
          description: room.description,
          price: room.price,
          area: room.area,
          address: room.address,
          city: room.city,
          images: room.images || [],
          amenities: room.amenities || [],
          rules: room.rules || [],
          nearbyPlaces: room.nearbyPlaces || [],
          propertyType: room.propertyType,
          roomType: room.roomType,
          isAvailable: room.isAvailable,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        } : null,
        landlord: landlord ? {
          id: landlord._id,
          _id: landlord._id,
          full_name: landlord.full_name,
          phone: landlord.phone,
          email: landlord.email,
          role: landlord.role,
          avatar: landlord.avatar
        } : null,
        contact: landlord ? {
          name: landlord.full_name,
          phone: landlord.phone,
          email: landlord.email,
          isVerified: landlord.role === 'landlord'
        } : null
      };
    });

    return { total, items: transformedPosts };
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
      roomId: room ? {
        id: room._id,
        _id: room._id,
        title: room.title,
        description: room.description,
        price: room.price,
        area: room.area,
        address: room.address,
        city: room.city,
        images: room.images || [],
        amenities: room.amenities || [],
        rules: room.rules || [],
        nearbyPlaces: room.nearbyPlaces || [],
        propertyType: room.propertyType,
        roomType: room.roomType,
        location: room.location,
        isAvailable: room.isAvailable,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      } : null,
      landlord: landlord
        ? {
            id: landlord._id,
            _id: landlord._id,
            full_name: landlord.full_name,
            phone: landlord.phone,
            email: landlord.email,
            role: landlord.role,
            avatar: landlord.avatar,
            last_login: landlord.last_login,
          }
        : null,
      contact: landlord
        ? {
            name: landlord.full_name,
            phone: landlord.phone,
            email: landlord.email,
            avatar: landlord.avatar,
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
