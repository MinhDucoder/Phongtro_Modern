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
    status: {
      type: String,
      enum: ["pending", "active", "expired", "rejected", "paused"],
      default: "pending",
    },
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
