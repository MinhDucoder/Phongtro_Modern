import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";
import Room from "../models/roomSchema.js";
import catchAsync from "../middlewares/catchAsync.js";
import mongoose from "mongoose";
import { sendPostApprovedNotification, sendPostRejectedNotification } from "../utils/notificationHelper.js";

class ModerationController {
  // Dashboard tổng quan
  getModerationDashboard = catchAsync(async (req, res) => {
    const [
      pendingPosts,
      totalUsers,
      bannedUsers,
      recentReports,
      todayStats
    ] = await Promise.all([
      Post.countDocuments({ status: 'pending' }),
      User.countDocuments({ is_deleted: { $ne: true } }),
      User.countDocuments({ is_banned: true }),
      // TODO: Add Report model and count reports
      0, // Placeholder for reports
      Post.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        },
        {
          $group: {
            _id: null,
            newPosts: { $sum: 1 },
            pendingToday: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
            },
            approvedToday: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const todayStat = todayStats[0] || {
      newPosts: 0,
      pendingToday: 0,
      approvedToday: 0
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          pendingPosts,
          totalUsers,
          bannedUsers,
          recentReports
        },
        todayStats: todayStat
      }
    });
  });

  // Lấy queue kiểm duyệt
  getModerationQueue = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status = 'pending', // pending, active, rejected, expired
      priority = 'all', // all, high, normal, low
      search = '',      // search by title, address, user
      category = '',    // loại phòng (phòng trọ, căn hộ, etc.)
      city = '',        // thành phố
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Xây dựng điều kiện tìm kiếm cho bảng Post
    const postFilter = { 
      is_deleted: { $ne: true } 
    };
    
    // Filter by status
    if (status && status !== 'all') {
      postFilter.status = status;
    }
    
    // Filter by priority if specified
    if (priority && priority !== 'all') {
      postFilter.moderationPriority = priority;
    }

    // Build complex search across all three tables
    let roomIds = [];
    let landlordIds = [];
    
    if (search && search.trim() !== '') {
      // 1. Tìm kiếm trong bảng Room
      const roomResults = await Room.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      
      roomIds = [...roomResults];
      
      // 2. Tìm kiếm trong bảng User
      const userResults = await User.find({
        $or: [
          { full_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone_number: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      
      landlordIds = [...userResults];
    }
    
    // Apply additional room filters
    let filteredRoomIds = [];
    if (category || city) {
      const roomFilter = {};
      
      if (city) {
        roomFilter.city = { $regex: city, $options: 'i' };
      }
      
      // TODO: Add category filter when room schema has category field
      
      const roomResults = await Room.find(roomFilter).distinct('_id');
      filteredRoomIds = [...roomResults];
    }
    
    // Combine all filters into Post query
    if (search && search.trim() !== '') {
      if (roomIds.length > 0 || landlordIds.length > 0) {
        const searchConditions = [];
        
        if (roomIds.length > 0) {
          searchConditions.push({ roomId: { $in: roomIds } });
        }
        
        if (landlordIds.length > 0) {
          searchConditions.push({ landlord: { $in: landlordIds } });
        }
        
        postFilter.$or = searchConditions;
      }
    }
    
    if ((category || city) && filteredRoomIds.length > 0) {
      postFilter.roomId = { $in: filteredRoomIds };
    }

    // Setup sorting options
    const sort = {};
    if (sortBy === 'createdAt') {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'priority') {
      // We'll handle priority sorting in memory after query
      sort.createdAt = -1; // Default secondary sort
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Count total matching documents for pagination
    const totalItems = await Post.countDocuments(postFilter);

    // Get posts with room and landlord data
    const posts = await Post.find(postFilter)
      .populate({
        path: 'landlord',
        select: 'full_name email is_verified phone_number avatar createdAt role',
        model: 'User'
      })
      .populate({
        path: 'roomId',
        select: 'title description address price images area city amenities isAvailable',
        model: 'Room'
      })
      .populate({
        path: 'moderatedBy',
        select: 'full_name email role',
        model: 'User'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Transform posts and calculate priority for each
    const items = posts.map(post => {
      const postObj = post.toObject();
      const priority = this.calculatePostPriority(post);
      const waitingTime = Date.now() - post.createdAt.getTime();
      
      return {
        ...postObj,
        type: 'post',
        priority,
        waitingTime,
        waitingHours: Math.floor(waitingTime / (1000 * 60 * 60)),
        roomInfo: post.roomId ? {
          title: post.roomId.title || 'Không có tiêu đề',
          description: post.roomId.description || '',
          address: post.roomId.address || 'Chưa có địa chỉ',
          price: post.roomId.price || 0,
          area: post.roomId.area || 0,
          city: post.roomId.city || '',
          hasImages: post.roomId.images && post.roomId.images.length > 0,
          imageCount: post.roomId.images ? post.roomId.images.length : 0,
          images: post.roomId.images || [],
          amenities: post.roomId.amenities || [],
          isAvailable: post.roomId.isAvailable
        } : null,
        landlordInfo: post.landlord ? {
          id: post.landlord._id,
          name: post.landlord.full_name || 'Chưa có tên',
          email: post.landlord.email || '',
          isVerified: post.landlord.is_verified || false,
          phone: post.landlord.phone_number || '',
          avatar: post.landlord.avatar || null,
          accountAge: Math.floor((Date.now() - new Date(post.landlord.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          role: post.landlord.role || 'user'
        } : null
      };
    });

    // Additional sorting by calculated priority if requested
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      items.sort((a, b) => {
        if (sortOrder === 'asc') {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
      });
    }

    // Get moderation stats for different statuses
    const [
      pendingCount,
      activeCount, 
      rejectedCount,
      expiredCount,
      todayModerated
    ] = await Promise.all([
      Post.countDocuments({ status: 'pending', is_deleted: { $ne: true } }),
      Post.countDocuments({ status: 'active', is_deleted: { $ne: true } }),
      Post.countDocuments({ status: 'rejected', is_deleted: { $ne: true } }),
      Post.countDocuments({ status: 'expired', is_deleted: { $ne: true } }),
      Post.countDocuments({
        moderatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        is_deleted: { $ne: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / parseInt(limit)),
          totalItems,
          limit: parseInt(limit)
        },
        stats: {
          pending: pendingCount,
          active: activeCount,
          rejected: rejectedCount,
          expired: expiredCount,
          todayModerated
        }
      }
    });
  });

  // Tính toán độ ưu tiên kiểm duyệt
  calculatePostPriority = (post) => {
    // If priority is already set, use it
    if (post.moderationPriority) {
      return post.moderationPriority;
    }
    
    const waitingHours = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    const isVerifiedLandlord = post.landlord?.is_verified;
    const hasImages = post.roomId?.images?.length > 0;
    const hasPremiumLevel = post.favouriteLevel && ['silver', 'gold', 'platinum'].includes(post.favouriteLevel);
    const isComplete = post.roomId && post.roomId.title && post.roomId.address && post.roomId.price;

    // Highest priority cases
    if (hasPremiumLevel || (isVerifiedLandlord && waitingHours > 12)) {
      return 'high';
    }
    
    // High priority cases
    if (waitingHours > 24 || isVerifiedLandlord) {
      return 'high';
    }
    
    // Normal priority cases
    if (hasImages || waitingHours > 12 || isComplete) {
      return 'normal';
    }
    
    return 'low';
  };

  // Quick actions
  quickApprove = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    if (type === 'post') {
      const post = await Post.findByIdAndUpdate(
        id,
        {
          status: 'active',
          moderatedAt: new Date(),
          moderatedBy: req.user._id
        },
        { new: true }
      ).populate('landlord', 'full_name email');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài đăng'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Đã duyệt bài đăng thành công',
        data: post
      });
    }
  });
  
  // Moderate a specific post (for frontend API integration)
  moderatePost = catchAsync(async (req, res) => {
    const { postId } = req.params;
    const { 
      status, 
      reason, 
      notes,
      contentIssues,
      pricingIssues,
      imageIssues,
      addressIssues,
      violationDetails,
      updateRoomAvailability = true,  // Option to update room availability
      notifyLandlord = true           // Option to send notification
    } = req.body;
    
    // Validate input
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }
    
    // If rejecting, require a reason
    if (status === 'rejected' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }
    
    // Find the post first to check if it exists
    const existingPost = await Post.findById(postId)
      .populate('landlord', 'full_name email phone_number')
      .populate('roomId');
      
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Prepare update data for post
      const updateData = {
        $set: {
          status: status === 'approved' ? 'active' : 'rejected',
          moderatedAt: new Date(),
          moderatedBy: req.user._id,
          'moderation.lastReviewedAt': new Date(),
        },
        $inc: {
          'moderation.reviewCount': 1
        }
      };
      
      if (status === 'rejected') {
        // Add rejection details
        updateData.$set.rejectionReason = reason;
        
        // Set resubmission eligibility date (3 days from now)
        const resubmissionDate = new Date();
        resubmissionDate.setDate(resubmissionDate.getDate() + 3);
        updateData.$set.resubmissionEligibleDate = resubmissionDate;
        
        // Add moderation issues flags if provided
        if (contentIssues !== undefined) updateData.$set['moderation.contentIssues'] = contentIssues;
        if (pricingIssues !== undefined) updateData.$set['moderation.pricingIssues'] = pricingIssues;
        if (imageIssues !== undefined) updateData.$set['moderation.imageIssues'] = imageIssues;
        if (addressIssues !== undefined) updateData.$set['moderation.addressIssues'] = addressIssues;
        if (violationDetails) updateData.$set['moderation.violationDetails'] = violationDetails;
      }
      
      if (notes) {
        updateData.$set.moderationNotes = notes;
      }
      
      // Update the post with the prepared data
      const post = await Post.findByIdAndUpdate(
        postId,
        updateData,
        { new: true, session }
      );
      
      // If approving the post, update the room availability
      if (status === 'approved' && updateRoomAvailability && existingPost.roomId) {
        await Room.findByIdAndUpdate(
          existingPost.roomId._id,
          { isAvailable: true },
          { session }
        );
      }
      
      // If rejecting and it's because of room details issues, mark what needs fixing
      if (status === 'rejected') {
        const roomUpdateData = {};
        
        if (pricingIssues || contentIssues || imageIssues || addressIssues) {
          roomUpdateData.needsCorrection = true;
          roomUpdateData.correctionAreas = [];
          
          if (pricingIssues) roomUpdateData.correctionAreas.push('price');
          if (contentIssues) roomUpdateData.correctionAreas.push('description');
          if (imageIssues) roomUpdateData.correctionAreas.push('images');
          if (addressIssues) roomUpdateData.correctionAreas.push('address');
        }
        
        if (Object.keys(roomUpdateData).length > 0 && existingPost.roomId) {
          await Room.findByIdAndUpdate(
            existingPost.roomId._id,
            roomUpdateData,
            { session }
          );
        }
      }
      
      // Commit the transaction
      await session.commitTransaction();
      
      // Fetch the fully populated post for the response
      const populatedPost = await Post.findById(postId)
        .populate('landlord', 'full_name email phone_number')
        .populate('roomId', 'title address price images area city')
        .populate('moderatedBy', 'full_name email');
      
      // Send notification to landlord if requested
      if (notifyLandlord && existingPost.landlord) {
        try {
          const postTitle = existingPost.roomId?.title || 'Phòng trọ';
          
          if (status === 'approved') {
            await sendPostApprovedNotification(
              existingPost.landlord._id,
              postTitle,
              postId
            );
          } else {
            await sendPostRejectedNotification(
              existingPost.landlord._id,
              postTitle,
              reason || 'Không đạt tiêu chuẩn',
              postId
            );
          }
          
          console.log(`✅ Notification sent to landlord ${existingPost.landlord._id}: Post ${postId} ${status}`);
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Non-critical error, continue with response
        }
      }
      
      res.status(200).json({
        success: true,
        message: status === 'approved' ? 'Đã duyệt bài đăng thành công' : 'Đã từ chối bài đăng thành công',
        data: {
          post: populatedPost,
          roomInfo: populatedPost.roomId ? {
            id: populatedPost.roomId._id,
            title: populatedPost.roomId.title || 'Không có tiêu đề',
            address: populatedPost.roomId.address || 'Chưa có địa chỉ',
            price: populatedPost.roomId.price || 0,
            area: populatedPost.roomId.area || 0,
            city: populatedPost.roomId.city || '',
            hasImages: populatedPost.roomId.images && populatedPost.roomId.images.length > 0,
            imageCount: populatedPost.roomId.images ? populatedPost.roomId.images.length : 0
          } : null,
          landlordInfo: populatedPost.landlord ? {
            id: populatedPost.landlord._id,
            name: populatedPost.landlord.full_name || 'Chưa có tên',
            email: populatedPost.landlord.email || '',
            phone: populatedPost.landlord.phone_number || ''
          } : null,
          moderation: {
            moderatedBy: populatedPost.moderatedBy ? {
              id: populatedPost.moderatedBy._id,
              name: populatedPost.moderatedBy.full_name || '',
              email: populatedPost.moderatedBy.email || ''
            } : null,
            moderatedAt: populatedPost.moderatedAt,
            issues: {
              contentIssues: populatedPost.moderation?.contentIssues || false,
              pricingIssues: populatedPost.moderation?.pricingIssues || false,
              imageIssues: populatedPost.moderation?.imageIssues || false,
              addressIssues: populatedPost.moderation?.addressIssues || false,
              violationDetails: populatedPost.moderation?.violationDetails || null
            }
          }
        }
      });
    } catch (error) {
      // Abort transaction if error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  });

  // Quick reject
  quickReject = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type, reason } = req.body;

    if (type === 'post') {
      const post = await Post.findByIdAndUpdate(
        id,
        {
          status: 'rejected',
          moderatedAt: new Date(),
          moderatedBy: req.user._id,
          rejectionReason: reason || 'Không phù hợp với quy định'
        },
        { new: true }
      ).populate('landlord', 'full_name email');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài đăng'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Đã từ chối bài đăng thành công',
        data: post
      });
    }
  });

  // Bulk moderation actions
  bulkModerationAction = catchAsync(async (req, res) => {
    const { itemIds, action, reason, type = 'post' } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một mục'
      });
    }

    let result;
    let message = '';

    if (type === 'post') {
      const updateData = {
        moderatedAt: new Date(),
        moderatedBy: req.user._id
      };

      switch (action) {
        case 'approve':
          updateData.status = 'active';
          message = 'Đã duyệt các bài đăng thành công';
          break;
        case 'reject':
          updateData.status = 'rejected';
          updateData.rejectionReason = reason || 'Không phù hợp với quy định';
          message = 'Đã từ chối các bài đăng thành công';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Hành động không hợp lệ'
          });
      }

      result = await Post.updateMany(
        { _id: { $in: itemIds } },
        updateData
      );
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        modifiedCount: result?.modifiedCount || 0
      }
    });
  });

  // Moderation history
  getModerationHistory = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      moderatorId,
      type = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { moderatedBy: { $exists: true } };

    if (moderatorId) {
      filter.moderatedBy = moderatorId;
    }

    const history = await Post.find(filter)
      .populate('moderatedBy', 'full_name email')
      .populate('landlord', 'full_name email')
      .populate('roomId', 'title')
      .sort({ moderatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });
  });

  // Removed moderation statistics endpoint
  
  // Get a specific post for moderation review with comprehensive details from posts, rooms and users
  getPostForModeration = catchAsync(async (req, res) => {
    const { postId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bài đăng không hợp lệ'
      });
    }
    
    // Get post with all related data
    const post = await Post.findById(postId)
      .populate({
        path: 'landlord',
        select: 'full_name email phone_number is_verified createdAt avatar role address', 
        model: 'User'
      })
      .populate({
        path: 'roomId',
        select: 'title description address city price area images amenities isAvailable landlord',
        model: 'Room',
        populate: {
          path: 'landlord',
          select: 'full_name',
          model: 'User'
        }
      })
      .populate({
        path: 'moderatedBy',
        select: 'full_name email role',
        model: 'User'
      });
      
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    // Get other posts by the same landlord
    const otherPostsByLandlord = await Post.find({
      landlord: post.landlord._id,
      _id: { $ne: post._id }
    })
    .select('status moderatedAt createdAt roomId')
    .populate({
      path: 'roomId',
      select: 'title price',
      model: 'Room'
    })
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get statistics about this landlord's posts
    const [landlordPostStats] = await Post.aggregate([
      { 
        $match: { 
          landlord: post.landlord._id,
        } 
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          activePosts: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "active"] }, 1, 0] 
            } 
          },
          pendingPosts: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0] 
            } 
          },
          rejectedPosts: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] 
            } 
          }
        }
      }
    ]);
    
    // Get similar posts in the same city or area
    let similarPostsQuery = {
      _id: { $ne: post._id },
      status: { $in: ['active', 'rejected'] }
    };
    
    // Only add city filter if the room has a city
    if (post.roomId && post.roomId.city) {
      similarPostsQuery['$expr'] = {
        $and: [
          { $ne: ["$_id", post._id] },
          { 
            $or: [
              { $eq: ["$roomId.city", post.roomId.city] },
              { $eq: ["$roomId.address", post.roomId.address] }
            ]
          }
        ]
      };
    }
    
    const similarPosts = await Post.find(similarPostsQuery)
      .populate({
        path: 'roomId',
        select: 'title address price',
        model: 'Room'
      })
      .select('status moderatedAt rejectionReason')
      .sort({ moderatedAt: -1 })
      .limit(5);
    
    // Transform post data for response
    const postData = post.toObject();
    
    // Additional room data - calculate derived values
    let roomDetails = null;
    if (post.roomId) {
      const hasTitle = post.roomId.title && post.roomId.title.trim() !== '';
      const hasDescription = post.roomId.description && post.roomId.description.trim() !== '';
      const hasImages = post.roomId.images && post.roomId.images.length > 0;
      const hasAddress = post.roomId.address && post.roomId.address.trim() !== '';
      
      const completionScore = [
        hasTitle ? 25 : 0,
        hasDescription ? 25 : 0,
        hasImages ? 25 : 0,
        hasAddress ? 25 : 0
      ].reduce((a, b) => a + b, 0);
      
      roomDetails = {
        title: post.roomId.title || 'Không có tiêu đề',
        description: post.roomId.description || 'Không có mô tả',
        address: post.roomId.address || 'Chưa có địa chỉ',
        city: post.roomId.city || '',
        price: post.roomId.price || 0,
        area: post.roomId.area || 0,
        images: post.roomId.images || [],
        amenities: post.roomId.amenities || [],
        isAvailable: post.roomId.isAvailable,
        completionScore: completionScore,
        hasTitle,
        hasDescription,
        hasImages,
        hasAddress
      };
    }
    
    // Additional landlord data - determine reliability
    let landlordDetails = null;
    if (post.landlord) {
      const verificationScore = post.landlord.is_verified ? 50 : 0;
      const experienceScore = Math.min(50, Math.floor((Date.now() - new Date(post.landlord.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7))); // 50% max, +1% per week
      
      landlordDetails = {
        id: post.landlord._id,
        name: post.landlord.full_name || 'Chưa có tên',
        email: post.landlord.email || '',
        phone: post.landlord.phone_number || '',
        isVerified: post.landlord.is_verified || false,
        avatar: post.landlord.avatar || null,
        role: post.landlord.role || 'user',
        address: post.landlord.address || null,
        accountAge: Math.floor((Date.now() - new Date(post.landlord.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        reliability: verificationScore + experienceScore,
        statistics: landlordPostStats || {
          totalPosts: 1,
          activePosts: 0,
          pendingPosts: 1,
          rejectedPosts: 0
        }
      };
    }
    
    // Add moderation recommendations
    const waitingTime = post.createdAt ? Math.floor((Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)) : 0;
    
    // Generate auto-recommendation based on various factors
    let recommendedAction = 'review';
    let recommendationReason = '';
    
    // Auto-approve conditions
    if (
      landlordDetails && landlordDetails.isVerified && 
      landlordDetails.statistics && landlordDetails.statistics.activePosts >= 3 &&
      landlordDetails.statistics.rejectedPosts === 0 &&
      roomDetails && roomDetails.completionScore >= 75
    ) {
      recommendedAction = 'approve';
      recommendationReason = 'Người đăng đã xác minh với lịch sử tốt và bài đăng đầy đủ thông tin';
    } 
    // Flagged for review conditions
    else if (
      !roomDetails.hasImages || 
      roomDetails.completionScore < 50 ||
      (landlordDetails.statistics && landlordDetails.statistics.rejectedPosts >= 2)
    ) {
      recommendedAction = 'flag';
      
      const reasons = [];
      if (!roomDetails.hasImages) reasons.push('Thiếu hình ảnh');
      if (roomDetails.completionScore < 50) reasons.push('Thiếu thông tin chi tiết');
      if (landlordDetails.statistics && landlordDetails.statistics.rejectedPosts >= 2) reasons.push('Người đăng có lịch sử bị từ chối');
      
      recommendationReason = reasons.join(', ');
    }
    
    res.status(200).json({
      success: true,
      data: {
        post: postData,
        roomDetails,
        landlordDetails,
        moderationContext: {
          otherPostsByLandlord,
          similarPosts,
          waitingTime,
          recommendedAction,
          recommendationReason
        }
      }
    });
  });
}

export default new ModerationController();