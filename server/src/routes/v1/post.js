import express from "express";
import PostController from "../../controllers/PostController.js";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import { checkPostPermission, usePostSlot, refundPostSlot } from "../../middlewares/subscriptionMiddleware.js";
import catchAsync from "../../middlewares/catchAsync.js";

const postRoute = express.Router();

// Route kiểm tra thông tin subscription
postRoute.get("/subscription-info", authenticate(), catchAsync(PostController.getSubscriptionInfo));

//comment authenicate() de test
postRoute.post("/", 
  authenticate(), 
  checkPostPermission, 
  catchAsync(PostController.create),
  usePostSlot
);

// Public route - chỉ trả về posts active
postRoute.get("/", catchAsync(PostController.list));

// Get suggestions - 5 phòng trọ mới nhất
postRoute.get("/suggestions/latest", catchAsync(PostController.suggestions));

// Admin route - xem tất cả posts với query params
postRoute.get("/admin/all", authenticate(), authorize("admin"), catchAsync(PostController.listAll));

postRoute.get('/:id', catchAsync(PostController.detail));
postRoute.put("/:id", authenticate(), authorize("admin"), catchAsync(PostController.update));
postRoute.delete("/:id", 
  authenticate(), 
  authorize("admin"), 
  refundPostSlot,
  catchAsync(PostController.remove)
);

export default postRoute;
