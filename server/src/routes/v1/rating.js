import express from "express";
import { ratePost, listRatings, removeRating } from "../../controllers/RatingController.js";
import { authenticate } from "../../middlewares/checkToken.js";
import { moderateContentMiddleware } from "../../middlewares/contentModerationMiddleware.js";

const router = express.Router({ mergeParams: true });

// Create or update rating với content moderation
router.post(
  "/rating",
  authenticate(),
  moderateContentMiddleware({
    fields: ["comment"],
    censorBadWords: true,
    strictMode: false,
    allowUrls: false,
    allowEmails: false,
    allowPhones: false,
  }),
  ratePost
);

// List ratings (public)
router.get("/ratings", listRatings);

// Delete rating (user delete own rating)
router.delete("/rating", authenticate(), removeRating);

export default router;
