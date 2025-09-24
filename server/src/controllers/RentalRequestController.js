// src/controllers/RentalRequestController.js
import rentalRequestService from "../services/rentalRequestService.js";
import { success, error } from "../utils/responeHandler.js";

class RentalRequestController {
  // Create a new rental request (from tenant)
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId, message, expectedMoveIn } = req.body;

      const request = await rentalRequestService.createRequest({
        userId,
        postId,
        message,
        expectedMoveIn
      });

      return success(res, request, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get rental requests for landlord's posts
  async getMyRequests(req, res, next) {
    try {
      const landlordId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status; // pending, accepted, rejected, canceled

      const filters = {};
      if (status && status !== 'all') {
        filters.status = status;
      }

      const result = await rentalRequestService.getLandlordRequests({
        landlordId,
        page,
        limit,
        filters
      });

      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get rental request statistics for landlord
  async getRequestStats(req, res, next) {
    try {
      const landlordId = req.user.id;
      const stats = await rentalRequestService.getRequestStats(landlordId);
      return success(res, stats);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Update request status (accept/reject)
  async updateRequestStatus(req, res, next) {
    try {
      const landlordId = req.user.id;
      const requestId = req.params.id;
      const { status, responseMessage } = req.body; // 'accepted' or 'rejected'

      const updatedRequest = await rentalRequestService.updateRequestStatus(
        requestId,
        landlordId,
        status,
        responseMessage
      );

      return success(res, updatedRequest);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Get request detail
  async getRequestDetail(req, res, next) {
    try {
      const landlordId = req.user.id;
      const requestId = req.params.id;

      const request = await rentalRequestService.getRequestDetail(requestId, landlordId);
      return success(res, request);
    } catch (err) {
      return error(res, err.message, 404);
    }
  }

  // Get tenant's requests (for tenant dashboard)
  async getTenantRequests(req, res, next) {
    try {
      const tenantId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await rentalRequestService.getTenantRequests({
        tenantId,
        page,
        limit
      });

      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new RentalRequestController();
