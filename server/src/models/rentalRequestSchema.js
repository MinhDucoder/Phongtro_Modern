// src/models/rentalRequestSchema.js
import mongoose from "mongoose";

const rentalRequestSchema = new mongoose.Schema(
  {
    // Người gửi yêu cầu (tenant)
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Bài đăng được yêu cầu
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    
    // Chủ nhà (lấy từ post)
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Tin nhắn từ tenant
    message: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Ngày dự kiến chuyển vào
    expectedMoveIn: {
      type: Date,
      required: true,
    },
    
    // Trạng thái yêu cầu
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "canceled"],
      default: "pending",
    },
    
    // Phản hồi từ landlord
    responseMessage: {
      type: String,
      trim: true,
    },
    
    // Thời gian phản hồi
    respondedAt: {
      type: Date,
    },
    
    // Thông tin liên hệ bổ sung
    contactInfo: {
      phone: String,
      email: String,
      preferredContactMethod: {
        type: String,
        enum: ["phone", "email", "both"],
        default: "both",
      },
    },
    
    // Thông tin cá nhân tenant
    tenantInfo: {
      age: Number,
      occupation: String,
      monthlyIncome: Number,
      rentalHistory: String,
      numberOfPeople: {
        type: Number,
        default: 1,
      },
      hasPets: {
        type: Boolean,
        default: false,
      },
      petDetails: String,
    },
    
    // Metadata
    viewedByLandlord: {
      type: Boolean,
      default: false,
    },
    
    viewedAt: Date,
    
    // Priority level (có thể dùng cho premium users)
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
rentalRequestSchema.index({ landlord: 1, status: 1, createdAt: -1 });
rentalRequestSchema.index({ tenant: 1, createdAt: -1 });
rentalRequestSchema.index({ post: 1 });

// Virtual for request age in days
rentalRequestSchema.virtual('requestAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for response time in hours (if responded)
rentalRequestSchema.virtual('responseTime').get(function() {
  if (this.respondedAt) {
    return Math.floor((this.respondedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

export default mongoose.model("RentalRequest", rentalRequestSchema);
