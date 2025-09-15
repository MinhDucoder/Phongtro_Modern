import express from "express";
import RoomController from "~/controllers/RoomController";

const roomRoute = express.Router();

roomRoute.get("/", RoomController.getAllRoom);
roomRoute.post("/create", RoomController.createRoom);
roomRoute.get("/:roomID", RoomController.getRoomByID);
roomRoute.patch("/:roomID", RoomController.updateRoom);
roomRoute.delete("/:roomID", RoomController.deleteRoom);

export default roomRoute;
