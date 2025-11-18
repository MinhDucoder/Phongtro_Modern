import Rating from "../models/ratingSchema.js";
import Post from "../models/postSchema.js";
import mongoose from "mongoose";
import { moderateContent } from "./contentModerationService.js";

/**
 * Upsert rating (create or update)
 * payload: { postId, userId, rating, comment }
 */
export const upsertRating = async ({ postId, userId, rating, comment }) => {
  console.log(postId, userId, rating, comment);

  let filteredComment = comment;
  if (comment) {
    const moderationResult = moderateContent(comment, {
      censorBadWords: true,
      strictMode: false,
      allowUrls: false,
      allowEmails: false,
      allowPhones: false,
    });
    filteredComment = moderationResult.filteredText;

    if (!moderationResult.isClean) {
      console.warn(`[Rating] Filtered bad words in comment:`, {
        postId,
        userId,
        violations: moderationResult.violations,
        score: moderationResult.score,
      });
    }
  }

  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  if (post.landlord?.toString() === userId.toString()) {
    throw new Error("Landlord cannot rate own post");
  }

  // Upsert rating document với comment đã được filter
  const result = await Rating.findOneAndUpdate(
    { post: postId, user: userId },
    { rating, comment: filteredComment },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const stats = await Rating.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId) } },
    {
      $group: {
        _id: "$post",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const updateData =
    stats.length > 0
      ? {
          averageRating: Number(stats[0].avgRating.toFixed(2)),
          totalRatings: stats[0].count,
        }
      : {
          averageRating: 0,
          totalRatings: 0,
        };

  await Post.findByIdAndUpdate(postId, { $set: updateData }, { runValidators: false });

  await result.populate("user", "full_name avatar");

  return result;
};

/** Get paginated ratings with optional sort/filter */
export const getRatings = async ({ postId, page = 1, limit = 10, sort = "-createdAt", star }) => {
  const skip = (page - 1) * limit;
  const filter = { post: postId };
  if (star) filter.rating = star; // optional filter by star

  const query = Rating.find(filter)
    .populate("user", "full_name avatar")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const [data, total] = await Promise.all([
    query.exec(),
    Rating.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/** Delete rating (by post + user) */
export const deleteRating = async ({ postId, userId }) => {
  await Rating.deleteOne({ post: postId, user: userId });

  const stats = await Rating.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId) } },
    {
      $group: {
        _id: "$post",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const updateData =
    stats.length > 0
      ? {
          averageRating: Number(stats[0].avgRating.toFixed(2)),
          totalRatings: stats[0].count,
        }
      : {
          averageRating: 0,
          totalRatings: 0,
        };

  await Post.findByIdAndUpdate(postId, { $set: updateData }, { runValidators: false });

  return true;
};
