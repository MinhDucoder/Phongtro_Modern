import express from "express";
import RoomController from "~/controllers/RoomController";
import { roomSchemaValidator } from "~/validations/roomValidator";
import { validate } from "~/middlewares/validate";
import { authorize } from "~/middlewares/checkToken";
const roomRoute = express.Router();

roomRoute.get("/", RoomController.getAllRoom);
roomRoute.post(
  "/create",
  validate(roomSchemaValidator, RoomController.createRoom)
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
roomRoute.delete("/:roomID", authorize("landlord", "admin"), RoomController.deleteRoom);

export default roomRoute;
