import express from "express";
import { authenticate } from "~/middlewares/checkToken";
import checkRole from "~/middlewares/checkRole";
import ReportController from "~/controllers/ReportController";
import { validate } from "~/validations/validate";
import {
  createReportSchema,
  updateReportStatusSchema,
} from "~/validations/reportValidation";
import createRateLimiter from "~/middlewares/rateLimiter";

const reportRoute = express.Router();

const reportRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: "Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau vài phút.",
  keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : req.ip),
});

// User routes
reportRoute.post(
  "/",
  authenticate(),
  reportRateLimiter,
  validate(createReportSchema),
  ReportController.createReport
);

reportRoute.get("/my", authenticate(), ReportController.getMyReports);

// Admin routes
reportRoute.get(
  "/stats",
  authenticate(),
  checkRole(["admin"]),
  ReportController.getStats
);

reportRoute.get(
  "/",
  authenticate(),
  checkRole(["admin"]),
  ReportController.getReports
);

reportRoute.get(
  "/:id",
  authenticate(),
  checkRole(["admin"]),
  ReportController.getReportById
);

reportRoute.patch(
  "/:id/status",
  authenticate(),
  checkRole(["admin"]),
  validate(updateReportStatusSchema),
  ReportController.updateStatus
);

export default reportRoute;