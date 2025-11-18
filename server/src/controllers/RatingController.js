import * as ratingService from "../services/ratingService.js";
import { success, error } from "../utils/responeHandler.js";

export const ratePost = async (req, res) => {
  try {
    const payload = {
      postId: req.params.id,
      userId: req.user.id,
      rating: Number(req.body.rating),
      comment: req.body.comment || "",
    };

    if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const rating = await ratingService.upsertRating(payload);
    return success(res, rating, 201);
  } catch (err) {
    // nếu là duplicate key (user đã đánh giá) — tuy upsert sẽ update
    console.error(err);
    return error(res, err.message || "Error", 400);
  }
};

export const listRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt", star } = req.query;
    const result = await ratingService.getRatings({
      postId: req.params.id,
      page: Number(page),
      limit: Number(limit),
      sort,
      star: star ? Number(star) : undefined,
    });
    return success(res, result);
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Error", 400);
  }
};

export const removeRating = async (req, res) => {
  try {
    await ratingService.deleteRating({
      postId: req.params.id,
      userId: req.user.id,
    });
    return success(res, { message: "Rating deleted" });
  } catch (err) {
    console.error(err);
    return error(res, err.message || "Error", 400);
  }
};
