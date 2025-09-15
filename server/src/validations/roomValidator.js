import Joi from "joi";

export const roomSchemaValidator = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  price: Joi.number().positive().required(),
  area: Joi.number().positive().required(),
  images: Joi.array().items(Joi.string().uri()),
  amenities: Joi.array().items(Joi.string()),
  isAvailable: Joi.boolean(),
});
