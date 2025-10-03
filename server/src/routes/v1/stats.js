// routes/v1/stats.js
import express from "express";
import statsController from "../../controllers/StatsController.js";
import authenticate from "../../middlewares/authenticate.js";
import { cacheMiddleware } from "../../middlewares/cacheMiddleware.js";

const router = express.Router();

// Public routes với caching
router.get("/overview", cacheMiddleware(300), statsController.getOverview); // 5 phút
router.get("/real-time", cacheMiddleware(30), statsController.getRealTime); // 30 giây
router.get("/trending", cacheMiddleware(600), statsController.getTrending); // 10 phút
router.get("/cities", cacheMiddleware(900), statsController.getCityStats); // 15 phút
router.get("/property-types", cacheMiddleware(900), statsController.getPropertyTypeStats); // 15 phút
router.get("/prices", cacheMiddleware(600), statsController.getPriceStats); // 10 phút

// Protected routes (cần authentication)
router.get("/users", authenticate, cacheMiddleware(300), statsController.getUserStats);

export default router;
