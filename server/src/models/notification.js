import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Tránh double index: để index ở schema.index phía dưới
    },
    type: {
      type: String,
      required: true,
      enum: [
        "view",
        "like",
        "call",
        "message",
        "post_approved",
        "post_rejected",
        "payment",
        "system",
        "booking",
        "review",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    relatedProperty: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
      title: String,
      image: String,
    },
    relatedUser: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      avatar: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient queries (tối ưu truy vấn phổ biến)
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;



