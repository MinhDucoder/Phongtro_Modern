// src/routes/v1/rentalRequest.js
import express from "express";
import RentalRequestController from "../../controllers/RentalRequestController.js";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import catchAsync from "../../middlewares/catchAsync.js";

const rentalRequestRoute = express.Router();

// All routes require authentication
rentalRequestRoute.use(authenticate());

// Create rental request (tenant)
rentalRequestRoute.post("/", catchAsync(RentalRequestController.create));

// Get tenant's requests (tenant dashboard)
rentalRequestRoute.get("/my-requests", catchAsync(RentalRequestController.getTenantRequests));

// Landlord routes
rentalRequestRoute.get("/landlord/requests", 
  authorize(['landlord', 'admin']), 
  catchAsync(RentalRequestController.getMyRequests)
);

rentalRequestRoute.get("/landlord/stats", 
  authorize(['landlord', 'admin']), 
  catchAsync(RentalRequestController.getRequestStats)
);

rentalRequestRoute.patch("/:id/status", 
  authorize(['landlord', 'admin']), 
  catchAsync(RentalRequestController.updateRequestStatus)
);

rentalRequestRoute.get("/:id", 
  authorize(['landlord', 'admin']), 
  catchAsync(RentalRequestController.getRequestDetail)
);

export default rentalRequestRoute;
