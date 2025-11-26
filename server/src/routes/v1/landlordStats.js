import express from "express";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import controller from "../../controllers/landlordStatsController.js";
import catchAsync from "../../middlewares/catchAsync.js";

const router = express.Router();

router.get("/overview", authenticate(), authorize(["landlord", "admin"]), catchAsync(controller.overview));
router.get("/posts", authenticate(), authorize(["landlord", "admin"]), catchAsync(controller.posts));
router.get("/post/:id/timeseries", authenticate(), authorize(["landlord", "admin"]), catchAsync(controller.postTimeseries));

export default router;






















