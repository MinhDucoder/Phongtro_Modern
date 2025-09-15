import mongoose from "mongoose";
import roomSchema from "~/models/roomSchema";

class RoomController {
  async createRoom(req, res, next) {
    const room = req.body;
    try {
      const { userID } = req.user
      const newRoom = {
        ...room,
        landlord: userID,
      };
      await roomSchema.create(newRoom);

      res.json("createe room success!");
    } catch (error) {
      next(error);
    }
  }
  async getAllRoom(req, res, next) {
    try {
      const {
        city,
        price_min,
        price_max,
        page = 1,
        limit = 10,
        sort = "createdAt", // mặc định sort theo ngày đăng
      } = req.query;

      const filter = {};
      if (city) filter.city = city;
      if (price_min || price_max) {
        filter.price = {};
        if (price_min) filter.price.$gte = Number(price_min);
        if (price_max) filter.price.$lte = Number(price_max);
      }

      // tính tổng số phòng để trả về meta phân trang
      const total = await roomSchema.countDocuments(filter);

      const rooms = await roomSchema
        .find(filter)
        .sort({ [sort]: -1 }) // -1: mới nhất lên đầu
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.json({
        data: rooms,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomByID(req, res, next) {
    try {
      const roomID = req.param.roomID;
      const room = await roomSchema.findById({ _id: roomID });
      if (!room) {
        res.status(404).json({ message: "Room not found!" });
      }
      res.json("success");
    } catch (error) {
      next(error);
    }
  }
  async updateRoom(req, res, next) {
    try {
      const roomID = req.params.id;
      const updatedRoom = await roomSchema.findByIdAndUpdate(
        roomID,
        req.body,
        { new: true } // trả về bản đã update
      );
      if (!updatedRoom)
        return res.status(404).json({ message: "Room not found" });
      res.json(updatedRoom);
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req, res, next) {
    try {
      const roomID = req.param.roomID;
      const result = await roomSchema.deleteOne({ _id: roomID });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Room not foud" });
      }
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new RoomController();
