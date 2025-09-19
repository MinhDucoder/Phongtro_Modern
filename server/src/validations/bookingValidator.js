import Joi from "joi";
import mongoose from "mongoose";

// Custom validator để check ObjectId
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('"{{#label}}" phải là ObjectId hợp lệ');
  }
  return value;
};

// Schema validate cho tạo mới Booking
export const createBookingSchema = Joi.object({
  room: Joi.string().custom(objectId).required(),
  user: Joi.string().custom(objectId).required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date()
    .greater(Joi.ref("checkIn"))
    .required()
    .messages({
      "date.greater": `"checkOut" phải sau "checkIn"`,
    }),
  totalPrice: Joi.number().positive().required(),
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled")
    .default("pending"),
});

// Schema validate cho update Booking
export const updateBookingSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "cancelled"),
  checkIn: Joi.date(),
  checkOut: Joi.date().greater(Joi.ref("checkIn")),
  totalPrice: Joi.number().positive(),
}).min(1); // bắt buộc phải có ít nhất 1 field để update
