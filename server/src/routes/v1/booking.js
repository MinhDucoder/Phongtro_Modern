import express from "express";
import bookingController from "../../controllers/BookingController.js";
import { authenticate, authorize } from "~/middlewares/checkToken.js";
import {
  createBookingSchema,
  updateBookingSchema,
} from "~/validations/bookingValidator.js";
import bookingSchema from "~/models/bookingSchema.js";
import { validate } from "~/validations/validate.js";
const router = express.Router();

router.post(
  "/",
  authenticate(),
  authorize(["user"]),
  validate(createBookingSchema),
  bookingController.create.bind(bookingController)
);

router.get(
  "/",
  authenticate(),
  authorize(["landlord", "admin"]),
  bookingController.list.bind(bookingController)
);
router.get(
  "/:id",
  authenticate(),
  authorize(["user", "landlord"]),
  bookingController.detail.bind(bookingController)
);
router.put(
  "/:id",
  authenticate(),
  authorize(["landlord", "admin"]),
  validate(updateBookingSchema),
  bookingController.update.bind(bookingController)
);

router.delete(
  "/:id",
  authenticate(),
  authorize(["landlord", "admin"]),
  bookingController.remove.bind(bookingController)
);

export default router;
