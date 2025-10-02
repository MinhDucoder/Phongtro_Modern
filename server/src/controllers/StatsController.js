// controllers/StatsController.js
import statsService from "../services/statsService.js";
import { success, error } from "../utils/responeHandler.js";

class StatsController {
  // Lấy tổng quan thống kê
  async getOverview(req, res, next) {
    try {
      const stats = await statsService.getOverviewStats();
      return success(res, stats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Lấy thống kê real-time
  async getRealTime(req, res, next) {
    try {
      const realTimeStats = await statsService.getRealTimeStats();
      return success(res, realTimeStats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Lấy xu hướng thống kê
  async getTrending(req, res, next) {
    try {
      const { period = '7d', limit = 10 } = req.query;
      const trending = await statsService.getTrendingStats(period, limit);
      return success(res, trending);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Lấy thống kê theo thành phố
  async getCityStats(req, res, next) {
    try {
      const cityStats = await statsService.getCityStats();
      return success(res, cityStats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Lấy thống kê theo loại phòng
  async getPropertyTypeStats(req, res, next) {
    try {
      const propertyStats = await statsService.getPropertyTypeStats();
      return success(res, propertyStats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Lấy thống kê giá thuê
  async getPriceStats(req, res, next) {
    try {
      const { city, propertyType } = req.query;
      const priceStats = await statsService.getPriceStats(city, propertyType);
      return success(res, priceStats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Lấy thống kê người dùng
  async getUserStats(req, res, next) {
    try {
      const userStats = await statsService.getUserStats();
      return success(res, userStats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
}

export default new StatsController();


