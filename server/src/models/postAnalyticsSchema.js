// src/models/postAnalyticsSchema.js
import mongoose from "mongoose";

const postAnalyticsSchema = new mongoose.Schema(
  {
    // Bài đăng được theo dõi
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    
    // Chủ nhà
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Ngày thống kê (YYYY-MM-DD)
    date: {
      type: String,
      required: true,
    },
    
    // Metrics
    metrics: {
      // Lượt xem
      views: {
        type: Number,
        default: 0,
      },
      
      // Lượt xem unique (theo IP)
      uniqueViews: {
        type: Number,
        default: 0,
      },
      
      // Lượt thích
      likes: {
        type: Number,
        default: 0,
      },
      
      // Số cuộc gọi
      calls: {
        type: Number,
        default: 0,
      },
      
      // Tin nhắn
      messages: {
        type: Number,
        default: 0,
      },
      
      // Yêu cầu thuê
      rentalRequests: {
        type: Number,
        default: 0,
      },
      
      // Lượt chia sẻ
      shares: {
        type: Number,
        default: 0,
      },
      
      // Thời gian xem trung bình (seconds)
      avgViewDuration: {
        type: Number,
        default: 0,
      },
    },
    
    // Breakdown by hour (0-23)
    hourlyViews: [{
      hour: {
        type: Number,
        min: 0,
        max: 23,
      },
      views: {
        type: Number,
        default: 0,
      },
    }],
    
    // Device breakdown
    deviceStats: {
      mobile: {
        type: Number,
        default: 0,
      },
      desktop: {
        type: Number,
        default: 0,
      },
      tablet: {
        type: Number,
        default: 0,
      },
    },
    
    // Location stats (top cities)
    locationStats: [{
      city: String,
      views: {
        type: Number,
        default: 0,
      },
    }],
    
    // Age demographics
    ageStats: {
      "18-25": {
        type: Number,
        default: 0,
      },
      "26-35": {
        type: Number,
        default: 0,
      },
      "36-45": {
        type: Number,
        default: 0,
      },
      "45+": {
        type: Number,
        default: 0,
      },
    },
    
    // Revenue generated (from premium packages, etc.)
    revenue: {
      type: Number,
      default: 0,
    },
    
    // Click-through rate (%)
    ctr: {
      type: Number,
      default: 0,
    },
    
    // Conversion rate (views to requests %)
    conversionRate: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true 
  }
);

// Compound index for efficient queries
postAnalyticsSchema.index({ post: 1, date: -1 });
postAnalyticsSchema.index({ landlord: 1, date: -1 });
postAnalyticsSchema.index({ date: -1 });

// Method to calculate CTR
postAnalyticsSchema.methods.calculateCTR = function() {
  if (this.metrics.views > 0) {
    const clicks = this.metrics.calls + this.metrics.messages + this.metrics.rentalRequests;
    this.ctr = ((clicks / this.metrics.views) * 100).toFixed(2);
  }
  return this.ctr;
};

// Method to calculate conversion rate
postAnalyticsSchema.methods.calculateConversionRate = function() {
  if (this.metrics.views > 0) {
    this.conversionRate = ((this.metrics.rentalRequests / this.metrics.views) * 100).toFixed(2);
  }
  return this.conversionRate;
};

export default mongoose.model("PostAnalytics", postAnalyticsSchema);
