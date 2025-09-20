import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";

class PostController {
  // POST /posts
  async create(req, res, next) {
    try {
      const { roomId, options, favouriteLevel } = req.body;
      // kiểm tra room có tồn tại và thuộc landlord này
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });
      if (String(room.landlord) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not your room" });
      }

      const post = await Post.create({
        roomId,
        landlord: req.user.id,
        options,
        favouriteLevel,
      });

      const populated = await post.populate([
        { path: "roomId" },
        { path: "landlord", select: "name avatarUrl role" },
      ]);

      res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }

  // GET /posts
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Fetch rooms first
      const rooms = await Room.find()
        .populate("landlord", "full_name avatar role email phone")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Room.countDocuments();

      
      const processedItems = rooms.map(room => ({
        _id: room._id,
        title: room.title || "",
        description: room.description || "",
        price: room.price || 0,
        area: room.area || 0,
        images: room.images || [],
        amenities: room.amenities || [],
        city: room.city || "",
        address: room.address || "",
        isAvailable: room.isAvailable || true,
        landlord: {
          _id: room.landlord?._id || null,
          full_name: room.landlord?.full_name || "",
          role: room.landlord?.role || "",
          phone: room.landlord?.phone || "",
          email: room.landlord?.email || ""
        },
        options: [], 
        favouriteLevel: "free", 
        status: "active", 
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }));

      res.json({ total, items: processedItems });
    } catch (err) {
      next(err);
    }
  }

  // GET /posts/:id
  async detail(req, res, next) {
    try {
      const post = await Post.findById(req.params.id)
        .populate({
          path: "roomId",
          select: "title description price area images amenities city address"
        })
        .populate("landlord", "full_name avatar role");

      if (!post) return res.status(404).json({ message: "Post not found" });
      
      // Xử lý dữ liệu để đảm bảo format nhất quán
      let processedPost;
      if (post.roomId && typeof post.roomId === 'object') {
        processedPost = {
          _id: post._id,
          ...post.roomId.toObject(),
          postId: post._id,
          landlord: post.landlord,
          options: post.options,
          favouriteLevel: post.favouriteLevel,
          status: post.status,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };
      } else {
        processedPost = post.toObject();
      }
      
      res.json(processedPost);
    } catch (err) {
      next(err);
    }
  }

  // PUT /posts/:id
  async update(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (String(post.landlord) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not your post" });
      }

      const { options, favouriteLevel, status } = req.body;
      if (options) post.options = options;
      if (favouriteLevel) post.favouriteLevel = favouriteLevel;
      if (status) post.status = status;

      await post.save();

      const populated = await post.populate([
        { path: "roomId" },
        { path: "landlord", select: "name avatarUrl role" },
      ]);

      res.json(populated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /posts/:id
  async remove(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (String(post.landlord) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not your post" });
      }

      await Post.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export default new PostController();
