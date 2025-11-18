import mongoose from "mongoose";

const REPORT_TYPES = ["spam", "fake", "inappropriate", "harassment", "scam", "other"];
const REPORT_STATUSES = ["pending", "investigating", "resolved", "dismissed"];

const reportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["post", "user"],
      required: true,
      index: true,
    },
    targetModel: {
      type: String,
      enum: ["Post", "User"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
      index: true,
    },
    type: {
      type: String,
      enum: REPORT_TYPES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    metadata: {
      screenshots: [
        {
          url: String,
          publicId: String,
        },
      ],
      additionalInfo: mongoose.Schema.Types.Mixed,
    },
    targetSnapshot: {
      title: String,
      slug: String,
      address: String,
      price: Number,
      status: String,
      url: String,
      landlord: {
        name: String,
        email: String,
        phone: String,
      },
      user: {
        full_name: String,
        email: String,
        phone: String,
        role: String,
      },
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
      maxlength: 2000,
    },
    adminResolution: {
      verificationMethod: String,
      actionsTaken: {
        type: [String],
        default: [],
      },
      responseMessage: String,
      notifyReporter: {
        type: Boolean,
        default: false,
      },
      respondedAt: Date,
    },
    resolvedAt: Date,
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.pre("validate", function (next) {
  if (!this.targetModel && this.targetType) {
    this.targetModel = this.targetType === "post" ? "Post" : "User";
  }
  if (!this.code) {
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.code = `RPT-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
  }
  next();
});

reportSchema.index({ createdAt: -1 });
reportSchema.index({ targetType: 1, status: 1 });
reportSchema.index({ reporter: 1, targetId: 1 });

export const REPORT_TYPE_OPTIONS = REPORT_TYPES;
export const REPORT_STATUS_OPTIONS = REPORT_STATUSES;

export default mongoose.model("Report", reportSchema);

