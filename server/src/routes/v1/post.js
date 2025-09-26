import express from "express";
import PostController from "../../controllers/PostController.js";
import { authenticate, authorize } from "../../middlewares/checkToken.js";
import catchAsync from "../../middlewares/catchAsync.js";

const postRoute = express.Router();

//comment authenicate() de test
postRoute.post("/", authenticate(), catchAsync(PostController.create));
// postRoute.get("/", authenticate(), catchAsync(PostController.list));
postRoute.get("/", catchAsync(PostController.list));

postRoute.get("/:id", authenticate(), catchAsync(PostController.detail));
postRoute.put("/:id", authenticate(), authorize("admin"), catchAsync(PostController.update));
postRoute.delete("/:id", authenticate(), authorize("admin"), catchAsync(PostController.remove));

export default postRoute;
