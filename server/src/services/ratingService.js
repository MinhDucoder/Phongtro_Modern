import Rating from "~/models/ratingSchema.js";
import Post from "~/models/postSchema.js";
import mongoose from "mongoose";

/**
 * Upsert rating (create or update)
 * payload: { postId, userId, rating, comment }
 */
export const upsertRating = async ({ postId, userId, rating, comment }) => {
    console.log(postId, userId, rating, comment);
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  if (post.landlord?.toString() === userId.toString()) {
    throw new Error("Landlord cannot rate own post");
  }

  // Upsert rating document
  const result = await Rating.findOneAndUpdate(
    { post: postId, user: userId },
    { rating, comment },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Recompute stats for this post
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

  if (stats.length > 0) {
    post.averageRating = Number(stats[0].avgRating.toFixed(2));
    post.totalRatings = stats[0].count;
  } else {
    post.averageRating = 0;
    post.totalRatings = 0;
  }

  await post.save();

  return result;
};

/** Get paginated ratings with optional sort/filter */
export const getRatings = async ({ postId, page = 1, limit = 10, sort = "-createdAt", star }) => {
  const skip = (page - 1) * limit;
  const filter = { post: postId };
  if (star) filter.rating = star; // optional filter by star

  const query = Rating.find(filter)
    .populate("user", "name avatar")
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

  // Recompute stats
  const post = await Post.findById(postId);
  if (!post) return true;

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

  if (stats.length > 0) {
    post.averageRating = Number(stats[0].avgRating.toFixed(2));
    post.totalRatings = stats[0].count;
  } else {
    post.averageRating = 0;
    post.totalRatings = 0;
  }

  await post.save();

  return true;
};
