// src/services/roomService.js
import Room from "../models/roomSchema.js";
import uploadService from "./uploadService.js";

class RoomService {
  async createRoom(userId, body, files) {
    const { title, description, price, address } = body;

    let imageResults = [];
    if (files && files.length > 0) {
      imageResults = await uploadService.uploadFiles(files, "Rooms");
    }

    const images = imageResults.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    const newRoom = await Room.create({
      title,
      description,
      price,
      address,
      images,
      landlord: userId,
    });

    return newRoom;
  }

  async getAllRooms({ city, price_min, price_max, page = 1, limit = 10, sort = "createdAt" }) {
    const filter = {};
    if (city) filter.city = city;
    if (price_min || price_max) {
      filter.price = {};
      if (price_min) filter.price.$gte = Number(price_min);
      if (price_max) filter.price.$lte = Number(price_max);
    }

    const total = await Room.countDocuments(filter);

    const rooms = await Room.find(filter)
      .sort({ [sort]: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      data: rooms,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRoomById(roomID) {
    const room = await Room.findById(roomID);
    if (!room) throw new Error("Room not found");
    return room;
  }

  async updateRoom(roomID, body, files) {
    const updateData = { ...body };

    if (files && files.length > 0) {
      const imageResults = await uploadService.uploadFiles(files, "Rooms");
      updateData.images = imageResults.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      }));
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomID, updateData, { new: true });
    if (!updatedRoom) throw new Error("Room not found");

    return updatedRoom;
  }

  async deleteRoom(roomID) {
    const room = await Room.findById(roomID);
    if (!room) throw new Error("Room not found");

    if (room.images?.length > 0) {
      await Promise.all(room.images.map((img) => uploadService.deleteFile(img.public_id)));
    }

    await Room.deleteOne({ _id: roomID });
    return true;
  }
}

export default new RoomService();
