// src/controllers/roomController.js
import roomService from "../services/roomService.js";
import { success, error } from "../utils/responeHandler.js";

class RoomController {
  async createRoom(req, res, next) {
    try {
      const room = await roomService.createRoom(req.user.id, req.body, req.files);
      return success(res, { message: "Create room success!", room }, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async getAllRoom(req, res, next) {
    try {
      const { city, price_min, price_max, page, limit, sort } = req.query;
      const result = await roomService.getAllRooms({ city, price_min, price_max, page, limit, sort });
      return success(res, result);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async getRoomByID(req, res, next) {
    try {
      const room = await roomService.getRoomById(req.params.roomID);
      return success(res, { message: "Get room success", room });
    } catch (err) {
      return error(res, err.message, 404);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const updatedRoom = await roomService.updateRoom(req.params.id, req.body, req.files);
      return success(res, { message: "Update success", room: updatedRoom });
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async deleteRoom(req, res, next) {
    try {
      await roomService.deleteRoom(req.params.roomID);
      return success(res, { message: "Delete room success" });
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new RoomController();
