import express from "express";
import RoomController from "~/controllers/RoomController";
import { roomSchemaValidator } from "~/validations/roomValidator";
import { validate } from "~/middlewares/validate";
const roomRoute = express.Router();

roomRoute.get("/", RoomController.getAllRoom);
roomRoute.post("/create", validate(roomSchemaValidator, RoomController.createRoom));
roomRoute.get("/:roomID", RoomController.getRoomByID);
roomRoute.patch("/:roomID", validate(roomSchemaValidator, RoomController.updateRoom));
roomRoute.delete("/:roomID", RoomController.deleteRoom);

export default roomRoute;
