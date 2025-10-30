import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    options: [
      {
        type: String,
        enum: ["aircon", "washing_machine", "balcony", "window", "fridge", "kitchen"],
      },
    ],
    favouriteLevel: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      default: "free",
    },
    propertyType: {
      type: String,
      enum: [
        "phong_tro",
        "nha_nguyen_can",
        "can_ho_chung_cu",
        "can_ho_mini",
        "o_ghep",
        "mat_bang"
      ],
      required: true,
      default: "phong_tro",
      index: true
    },
    roomType: {
      type: String,
      enum: [
        "phong_don",
        "phong_doi", 
        "phong_ba",
        "phong_tu",
        "phong_nam",
        "phong_sau",
        "phong_bay",
        "phong_tam",
        "phong_chin",
        "phong_muoi"
      ],
      required: false,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "rejected", "paused"],
      default: "pending",
    },
    // Thời hạn tin đăng
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Index để query tin hết hạn nhanh
    },
    postDuration: {
      type: Number, // Số ngày tin đăng có hiệu lực (7, 15, 30...)
      required: true,
      default: 30,
    },
    // Có thể gia hạn tin không
    canExtend: {
      type: Boolean,
      default: true,
    },
    // Số lần đã gia hạn
    extendedCount: {
      type: Number,
      default: 0,
    },
    // Lịch sử gia hạn
    extensionHistory: [{
      extendedAt: Date,
      extendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      addedDays: Number,
      newExpiryDate: Date,
    }],
    // Moderation fields
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    moderationNotes: {
      type: String,
    },
    moderationPriority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal"
    },
    moderation: {
      contentIssues: {
        type: Boolean,
        default: false
      },
      pricingIssues: {
        type: Boolean,
        default: false
      },
      imageIssues: {
        type: Boolean,
        default: false
      },
      addressIssues: {
        type: Boolean,
        default: false
      },
      violationDetails: {
        type: String
      },
      reviewCount: {
        type: Number,
        default: 0
      },
      lastReviewedAt: {
        type: Date
      }
    },
    // Basic analytics counters
    views: {
      total: { type: Number, default: 0 }
    },
    visits: {
      total: { type: Number, default: 0 }
    },
    // When rejected, expiry date for resubmission
    resubmissionEligibleDate: {
      type: Date
    },
    // For auto-approval rules
    autoApprovalEligible: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
