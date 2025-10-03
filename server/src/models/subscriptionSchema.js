import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subscriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageType: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      required: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // số ngày
      required: true,
    },
    postLimit: {
      type: Number, // số tin đăng được phép
      required: true,
    },
    priority: {
      type: Number, // độ ưu tiên hiển thị
      default: 0,
    },
    features: [{
      type: String, // các tính năng đặc biệt
    }],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usedPosts: {
      type: Number,
      default: 0,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: { 
      createdAt: "created_at", 
      updatedAt: "updated_at" 
    } 
  }
);

// Index cho tìm kiếm
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

// Virtual để kiểm tra gói còn hạn
subscriptionSchema.virtual('isValid').get(function() {
  return this.status === 'active' && 
         this.endDate > new Date() && 
         this.usedPosts < this.postLimit;
});

// Middleware để tự động cập nhật status khi hết hạn
subscriptionSchema.pre('save', function(next) {
  if (this.endDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const Subscription = model("Subscription", subscriptionSchema);
export default Subscription;