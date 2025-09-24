// src/services/rentalRequestService.js
import RentalRequest from "../models/rentalRequestSchema.js";
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";

class RentalRequestService {
  // Create a new rental request
  async createRequest({ userId, postId, message, expectedMoveIn, contactInfo, tenantInfo }) {
    try {
      // Get post and landlord info
      const post = await Post.findById(postId).populate('landlord').populate('roomId');
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user already has a pending request for this post
      const existingRequest = await RentalRequest.findOne({
        tenant: userId,
        post: postId,
        status: 'pending'
      });

      if (existingRequest) {
        throw new Error('You already have a pending request for this property');
      }

      // Get tenant info
      const tenant = await User.findById(userId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Create request
      const request = new RentalRequest({
        tenant: userId,
        post: postId,
        landlord: post.landlord._id,
        message,
        expectedMoveIn,
        contactInfo: contactInfo || {
          phone: tenant.phone,
          email: tenant.email,
          preferredContactMethod: 'both'
        },
        tenantInfo: tenantInfo || {}
      });

      await request.save();

      // Populate before returning
      await request.populate([
        { path: 'tenant', select: 'full_name email phone' },
        { path: 'landlord', select: 'full_name email phone' },
        { 
          path: 'post', 
          populate: { 
            path: 'roomId', 
            select: 'title price address city images' 
          } 
        }
      ]);

      return request;
    } catch (error) {
      throw new Error(`Error creating rental request: ${error.message}`);
    }
  }

  // Get rental requests for landlord's posts
  async getLandlordRequests({ landlordId, page, limit, filters }) {
    try {
      const skip = (page - 1) * limit;
      
      let query = { landlord: landlordId, ...filters };

      const requests = await RentalRequest.find(query)
        .populate({
          path: 'tenant',
          select: 'full_name email phone avatar created_at'
        })
        .populate({
          path: 'post',
          populate: {
            path: 'roomId',
            select: 'title price address city images area'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await RentalRequest.countDocuments(query);

      return {
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      throw new Error(`Error getting landlord requests: ${error.message}`);
    }
  }

  // Get request statistics for landlord
  async getRequestStats(landlordId) {
    try {
      const stats = await RentalRequest.aggregate([
        { $match: { landlord: landlordId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        canceled: 0
      };

      stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
      });

      // Get recent request trends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentRequests = await RentalRequest.countDocuments({
        landlord: landlordId,
        createdAt: { $gte: sevenDaysAgo }
      });

      const previousWeekRequests = await RentalRequest.countDocuments({
        landlord: landlordId,
        createdAt: { 
          $gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lt: sevenDaysAgo
        }
      });

      const trend = previousWeekRequests > 0 
        ? ((recentRequests - previousWeekRequests) / previousWeekRequests * 100).toFixed(1)
        : recentRequests > 0 ? '+100' : '0';

      result.weeklyTrend = `${trend > 0 ? '+' : ''}${trend}%`;
      result.recentRequests = recentRequests;

      return result;
    } catch (error) {
      throw new Error(`Error getting request stats: ${error.message}`);
    }
  }

  // Update request status
  async updateRequestStatus(requestId, landlordId, status, responseMessage) {
    try {
      const request = await RentalRequest.findOne({
        _id: requestId,
        landlord: landlordId
      });

      if (!request) {
        throw new Error('Request not found or unauthorized');
      }

      if (request.status !== 'pending') {
        throw new Error('Request has already been processed');
      }

      request.status = status;
      request.responseMessage = responseMessage;
      request.respondedAt = new Date();
      request.viewedByLandlord = true;

      await request.save();

      // Populate before returning
      await request.populate([
        { path: 'tenant', select: 'full_name email phone' },
        { 
          path: 'post', 
          populate: { 
            path: 'roomId', 
            select: 'title price address city' 
          } 
        }
      ]);

      return request;
    } catch (error) {
      throw new Error(`Error updating request status: ${error.message}`);
    }
  }

  // Get request detail
  async getRequestDetail(requestId, landlordId) {
    try {
      const request = await RentalRequest.findOne({
        _id: requestId,
        landlord: landlordId
      })
      .populate({
        path: 'tenant',
        select: 'full_name email phone avatar created_at'
      })
      .populate({
        path: 'post',
        populate: {
          path: 'roomId',
          select: 'title price address city images area amenities'
        }
      });

      if (!request) {
        throw new Error('Request not found or unauthorized');
      }

      // Mark as viewed
      if (!request.viewedByLandlord) {
        request.viewedByLandlord = true;
        request.viewedAt = new Date();
        await request.save();
      }

      return request;
    } catch (error) {
      throw new Error(`Error getting request detail: ${error.message}`);
    }
  }

  // Get tenant's requests (for tenant dashboard)
  async getTenantRequests({ tenantId, page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const requests = await RentalRequest.find({ tenant: tenantId })
        .populate({
          path: 'landlord',
          select: 'full_name email phone'
        })
        .populate({
          path: 'post',
          populate: {
            path: 'roomId',
            select: 'title price address city images'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await RentalRequest.countDocuments({ tenant: tenantId });

      return {
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      throw new Error(`Error getting tenant requests: ${error.message}`);
    }
  }

  // Cancel request (by tenant)
  async cancelRequest(requestId, tenantId) {
    try {
      const request = await RentalRequest.findOne({
        _id: requestId,
        tenant: tenantId,
        status: 'pending'
      });

      if (!request) {
        throw new Error('Request not found or cannot be canceled');
      }

      request.status = 'canceled';
      await request.save();

      return request;
    } catch (error) {
      throw new Error(`Error canceling request: ${error.message}`);
    }
  }

  // Get request analytics for landlord
  async getRequestAnalytics(landlordId, timeRange) {
    try {
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const analytics = await RentalRequest.aggregate([
        {
          $match: {
            landlord: landlordId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            requests: {
              $push: {
                status: "$_id.status",
                count: "$count"
              }
            },
            totalRequests: { $sum: "$count" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return analytics;
    } catch (error) {
      throw new Error(`Error getting request analytics: ${error.message}`);
    }
  }
}

export default new RentalRequestService();
