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

      const [items, total] = await Promise.all([
        Post.find()
          .populate("roomId")
          .populate("landlord", "name avatarUrl role")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Post.countDocuments(),
      ]);

      res.json({ total, items });
    } catch (err) {
      next(err);
    }
  }

  // GET /posts/:id
  async detail(req, res, next) {
    try {
      const post = await Post.findById(req.params.id)
        .populate("roomId")
        .populate("landlord", "name avatarUrl role");

      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
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
