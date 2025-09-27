import express from "express";
import RoleController from "~/controllers/RoleController.js";
import { authenticate, authorize } from "~/middlewares/checkToken";

const roleRoute = express.Router();

// User
roleRoute.post(
  "/request",
  authenticate(),
  authorize("user"),
  RoleController.requestRole
);
roleRoute.get("/my-requests", authenticate(), RoleController.myRequest);

// Admin
roleRoute.get(
  "/",
  authenticate(),
  authorize("admin"),
  RoleController.listRequests
);
roleRoute.patch(
  "/:id",
  authenticate(),
  authorize("admin"),
  RoleController.reviewRequest
);

export default roleRoute;
