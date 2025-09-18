import express from "express";
import RoomController from "~/controllers/RoomController";
import { roomSchemaValidator } from "~/validations/roomValidator";
import { validate } from "~/middlewares/validate";
import { authorize } from "~/middlewares/checkToken";
import { authenticate } from "../../middlewares/checkToken";
import uploadRoute from "./upload";
import uploadMiddleware from "../../middlewares/uploadMiddleware.js";

const roomRoute = express.Router();

roomRoute.get("/", RoomController.getAllRoom);
roomRoute.post(
  "/create",
  uploadMiddleware.array("images", 5),
  authenticate(),
  authorize("landlord"),
  validate(roomSchemaValidator),
  RoomController.createRoom
);
roomRoute.get("/:roomID", RoomController.getRoomByID);
roomRoute.patch(
  "/:roomID",
  validate(
    roomSchemaValidator,
    authorize("landlord", "admin"),
    RoomController.updateRoom
  )
);
roomRoute.delete(
  "/:roomID",
  authorize("landlord", "admin"),
  RoomController.deleteRoom
);
roomRoute.use("/uploads", uploadRoute);

export default roomRoute;
