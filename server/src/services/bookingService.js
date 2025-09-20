import Booking from "../models/bookingSchema.js";

class BookingService {
  async create(data) {
    // (Optional) Kiểm tra phòng có bị trùng lịch không
    const conflict = await Booking.findOne({
      room: data.room,
      status: { $ne: "cancelled" },
      $or: [
        { checkIn: { $lt: data.checkOut }, checkOut: { $gt: data.checkIn } },
      ],
    });
    if (conflict) {
      throw new Error("Room already booked in this time range");
    }

    const booking = new Booking(data);
    await booking.save();
    return booking.populate("room");
  }

  async findAll({ page = 1, limit = 20, status, userId }) {
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    return await Booking.find(query)
      .populate("room")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Booking.findById(id).populate("room");
  }

  async update(id, data) {
    // Nếu update ngày → check validate
    if (data.checkIn && data.checkOut) {
      if (new Date(data.checkIn) >= new Date(data.checkOut)) {
        throw new Error("checkOut must be later than checkIn");
      }
    }

    const booking = await Booking.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("room");

    return booking;
  }

  async delete(id) {
    // Soft delete thay vì xoá cứng
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    ).populate("room");

    return booking;
  }
}

export default new BookingService();
