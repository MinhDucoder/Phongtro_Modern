import Joi from "joi";
import { REPORT_STATUS_OPTIONS, REPORT_TYPE_OPTIONS } from "../models/reportSchema.js";

export const createReportSchema = Joi.object({
  targetId: Joi.string().required().messages({
    "any.required": "Vui lòng chọn đối tượng cần báo cáo",
  }),
  targetType: Joi.string()
    .valid("post", "user")
    .required()
    .messages({
      "any.only": "Loại đối tượng báo cáo không hợp lệ",
    }),
  type: Joi.string()
    .valid(...REPORT_TYPE_OPTIONS)
    .required()
    .messages({
      "any.only": "Loại vi phạm không hợp lệ",
    }),
  description: Joi.string().min(10).max(2000).required(),
  metadata: Joi.object({
    screenshots: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          publicId: Joi.string().optional(),
        })
      )
      .max(5),
    additionalInfo: Joi.object().unknown(true),
  }).optional(),
});

const resolutionSchema = Joi.object({
  verificationMethod: Joi.string().allow("", null).max(500),
  actionsTaken: Joi.array().items(Joi.string().max(200)).max(10),
  responseMessage: Joi.string().allow("", null).max(2000),
  notifyReporter: Joi.boolean(),
});

export const updateReportStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...REPORT_STATUS_OPTIONS)
    .required(),
  adminNote: Joi.string().allow("", null).max(2000),
  resolution: resolutionSchema.optional(),
});

