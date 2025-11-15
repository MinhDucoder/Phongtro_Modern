import express from "express";
import { ratePost, listRatings, removeRating } from "~/controllers/RatingController.js";
import { authenticate } from "~/middlewares/checkToken.js"; // dùng middleware xác thực của bạn

const router = express.Router({ mergeParams: true });

// Create or update rating
router.post("/rating", authenticate(), ratePost);

// List ratings (public)
router.get("/ratings", listRatings);

// Delete rating (user delete own rating)
router.delete("/rating", authenticate(), removeRating);

export default router;
