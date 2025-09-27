// src/routes/v1/dashboard.js
import express from "express";
import DashboardController from "../../controllers/DashboardController.js";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import catchAsync from "../../middlewares/catchAsync.js";

const dashboardRoute = express.Router();

// Admin dashboard routes
dashboardRoute.get("/admin/overview", authenticate(), authorize(['admin']), catchAsync(DashboardController.getAdminOverview));

// All dashboard routes require authentication and landlord/admin role
dashboardRoute.use(authenticate());
dashboardRoute.use(authorize(['landlord', 'admin']));

// Dashboard overview
dashboardRoute.get("/overview", catchAsync(DashboardController.getOverview));

// Posts management
dashboardRoute.get("/posts", catchAsync(DashboardController.getMyPosts));
dashboardRoute.get("/posts/:id", catchAsync(DashboardController.getPostById));
dashboardRoute.post("/posts", catchAsync(DashboardController.createPost));
dashboardRoute.put("/posts/:id", catchAsync(DashboardController.updatePost));
dashboardRoute.delete("/posts/:id", catchAsync(DashboardController.deletePost));
dashboardRoute.patch("/posts/:id/status", catchAsync(DashboardController.updatePostStatus));
dashboardRoute.patch("/posts/:id/renew", catchAsync(DashboardController.renewPost));

// Analytics
dashboardRoute.get("/analytics", catchAsync(DashboardController.getPostAnalytics));

// Activities
dashboardRoute.get("/activities", catchAsync(DashboardController.getRecentActivities));

// Quick stats for widgets
dashboardRoute.get("/quick-stats", catchAsync(DashboardController.getQuickStats));

export default dashboardRoute;
