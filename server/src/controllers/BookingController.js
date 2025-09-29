import bookingService from "../services/bookingService.js";
import mongoose from "mongoose";
import { success, error } from "~/utils/responeHandler.js";
class BookingController {
  async create(req, res, next) {
    try {
      const userBooking = req.user;

      const newBooking = {
        user: new mongoose.Types.ObjectId(userBooking._id || userBooking.id),
        ...req.body,
      };

      const bookingResult = await bookingService.create(newBooking);
      res.success(201, "Booking created successfully", bookingResult);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { page = 1, limit = 10, status, userId } = req.query;
      const bookings = await bookingService.findAll({
        page,
        limit,
        status,
        userId,
      });
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async detail(req, res, next) {
    try {
      const booking = await bookingService.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const booking = await bookingService.update(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const booking = await bookingService.delete(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
