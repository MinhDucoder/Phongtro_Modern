import roomSchema from "~/models/roomSchema.js";
import uploadService from "~/services/uploadService.js";

class RoomController {
  // Create Room
  // POST /rooms
  async createRoom(req, res, next) {
    try {
      // Vì dùng form-data, dữ liệu text cũng sẽ nằm trong req.body
      const { title, description, price, address } = req.body;

      let imageResults = [];
      if (req.files && req.files.length > 0) {
        imageResults = await uploadService.uploadFiles(req.files, "Rooms");
      }

      // Chỉ lấy ra url + public_id
      const images = imageResults.map((img) => ({
        url: img.secure_url, // Cloudinary trả secure_url thay vì url
        public_id: img.public_id,
      }));
      console.log(req.user);
      // userID được attach từ middleware auth
      const { id } = req.user;

      const newRoom = await roomSchema.create({
        title,
        description,
        price,
        address,
        images,
        landlord: id,
      });

      await Promise.all(
        newRoom.images.map((img) => uploadService.deleteFile(img.public_id))
      );

      while (newRoom.images.public_id) {
        await uploadService.deleteFile(newRoom.images.public_id);
      }

      res.status(201).json({
        message: "Create room success!",
        room: newRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get All Rooms
  async getAllRoom(req, res, next) {
    try {
      const {
        city,
        price_min,
        price_max,
        page = 1,
        limit = 10,
        sort = "createdAt",
      } = req.query;

      const filter = {};
      if (city) filter.city = city;
      if (price_min || price_max) {
        filter.price = {};
        if (price_min) filter.price.$gte = Number(price_min);
        if (price_max) filter.price.$lte = Number(price_max);
      }

      const total = await roomSchema.countDocuments(filter);

      const rooms = await roomSchema
        .find(filter)
        .sort({ [sort]: -1 })
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

  // Get Room by ID
  async getRoomByID(req, res, next) {
    try {
      const { roomID } = req.params;
      const room = await roomSchema.findById(roomID);
      if (!room) {
        return res.status(404).json({ message: "Room not found!" });
      }
      res.json({ message: "Get room success", room });
    } catch (error) {
      next(error);
    }
  }

  // Update Room
  async updateRoom(req, res, next) {
    try {
      const { id } = req.params;

      let updateData = { ...req.body };

      // Nếu có upload thêm ảnh mới
      if (req.files && req.files.length > 0) {
        const imageResults = await uploadService.uploadFiles(
          req.files,
          "Rooms"
        );
        const images = imageResults.map((img) => ({
          url: img.url,
          public_id: img.public_id,
        }));
        updateData.images = images;
      }

      const updatedRoom = await roomSchema.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json({ message: "Update success", room: updatedRoom });
    } catch (error) {
      next(error);
    }
  }

  // Delete Room
  async deleteRoom(req, res, next) {
    try {
      const { roomID } = req.params;

      // Xóa trong DB
      const room = await roomSchema.findById(roomID);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Nếu room có ảnh thì xóa luôn trên Cloudinary
      await Promise.all(
        room.images.map((img) => uploadService.deleteFile(img.public_id))
      );

      await roomSchema.deleteOne({ _id: roomID });

      res.json({ message: "Delete room success" });
    } catch (error) {
      next(error);
    }
  }
}

export default new RoomController();
