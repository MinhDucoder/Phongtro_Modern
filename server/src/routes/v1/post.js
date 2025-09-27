import express from "express";
import PostController from "../../controllers/PostController.js";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import catchAsync from "../../middlewares/catchAsync.js";

const postRoute = express.Router();

//comment authenicate() de test
postRoute.post("/", authenticate(), catchAsync(PostController.create));

// Public route - chỉ trả về posts active
postRoute.get("/", catchAsync(PostController.list));

// Admin route - xem tất cả posts với query params
postRoute.get("/admin/all", authenticate(), authorize("admin"), catchAsync(PostController.listAll));

postRoute.get('/:id', catchAsync(PostController.detail));
postRoute.put("/:id", authenticate(), authorize("admin"), catchAsync(PostController.update));
postRoute.delete("/:id", authenticate(), authorize("admin"), catchAsync(PostController.remove));

export default postRoute;
