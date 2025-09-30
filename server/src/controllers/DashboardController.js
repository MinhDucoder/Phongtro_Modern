// src/controllers/DashboardController.js
import dashboardService from "../services/dashboardService.js";
import { success, error } from "../utils/responeHandler.js";

class DashboardController {
  // Get admin dashboard overview statistics
  async getAdminOverview(req, res, next) {
    try {
      const adminOverview = await dashboardService.getAdminDashboardOverview();
      return success(res, adminOverview);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get dashboard overview statistics
  async getOverview(req, res, next) {
    try {
      const userId = req.user.id;
      const overview = await dashboardService.getDashboardOverview(userId);
      return success(res, overview);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get landlord's posts with filters and pagination
  async getMyPosts(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const search = req.query.search;

      const filters = { landlord: userId };
      if (status && status !== 'all') {
        filters.status = status;
      }

      const result = await dashboardService.getLandlordPosts({
        userId,
        page,
        limit,
        filters,
        search
      });
      
      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }


  // Get post by ID for editing
  async getPostById(req, res, next) {
    try {
      const userId = req.user.id;
      const postId = req.params.id;

      const post = await dashboardService.getPostById(postId, userId);
      return success(res, post);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Renew expired post
  async renewPost(req, res, next) {
    try {
      const userId = req.user.id;
      const postId = req.params.id;

      const renewedPost = await dashboardService.renewPost(postId, userId);
      return success(res, renewedPost);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get post analytics
  async getPostAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const timeRange = req.query.timeRange || '7d'; // 24h, 7d, 30d, 90d
      const postId = req.query.postId; // specific post or 'all'

      const analytics = await dashboardService.getPostAnalytics(userId, timeRange, postId);
      return success(res, analytics);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get recent activities
  async getRecentActivities(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const activities = await dashboardService.getRecentActivities(userId, limit);
      return success(res, activities);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get single post by ID
  async getPostById(req, res, next) {
    try {
      const userId = req.user.id;
      const postId = req.params.id;

      const post = await dashboardService.getPostById(postId, userId);
      return success(res, post);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Create new post
  async createPost(req, res, next) {
    try {
      const userId = req.user.id;
      const postData = req.body;

      const newPost = await dashboardService.createPost(userId, postData);
      return success(res, newPost, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Update existing post
  async updatePost(req, res, next) {
    try {
      const userId = req.user.id;
      const postId = req.params.id;
      const updateData = req.body;

      const updatedPost = await dashboardService.updatePost(postId, userId, updateData);
      return success(res, updatedPost);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Delete post
  async deletePost(req, res, next) {
    try {
      const userId = req.user.id;
      const postId = req.params.id;

      await dashboardService.deletePost(postId, userId);
      return success(res, { message: 'Post deleted successfully' });
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get quick stats for dashboard widgets
  async getQuickStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await dashboardService.getQuickStats(userId);
      return success(res, stats);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get post analytics
  async getPostAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const timeRange = req.query.timeRange || '7d';
      const postId = req.query.postId;

      const analytics = await dashboardService.getPostAnalytics(userId, { timeRange, postId });
      return success(res, analytics);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get recent activities
  async getRecentActivities(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const activities = await dashboardService.getRecentActivities(userId, limit);
      return success(res, activities);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new DashboardController();
