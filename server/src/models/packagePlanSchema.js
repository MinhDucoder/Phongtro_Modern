import mongoose from "mongoose";

const { Schema, model } = mongoose;

const packagePlanSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      required: true,
      unique: true,
    },
    name: {
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
      type: Number, // độ ưu tiên hiển thị (cao hơn = hiển thị trước)
      default: 0,
    },
    features: [{
      type: String, // các tính năng đặc biệt
    }],
    description: {
      type: String,
    },
    color: {
      type: String, // màu hiển thị gói
      default: "#gray",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: { 
      createdAt: "created_at", 
      updatedAt: "updated_at" 
    } 
  }
);

// Index
packagePlanSchema.index({ type: 1 });
packagePlanSchema.index({ isActive: 1, sortOrder: 1 });

const PackagePlan = model("PackagePlan", packagePlanSchema);

// Seed data mặc định
const seedPackages = async () => {
  try {
    const count = await PackagePlan.countDocuments();
    if (count === 0) {
      await PackagePlan.insertMany([
        {
          type: "free",
          name: "Gói Miễn Phí",
          price: 0,
          duration: 30,
          postLimit: 3,
          priority: 0,
          features: ["Đăng 3 tin miễn phí", "Hiển thị cơ bản"],
          description: "Gói miễn phí cho người dùng mới",
          color: "#gray-500",
          sortOrder: 1,
        },
        {
          type: "silver",
          name: "Gói Bạc",
          price: 50000,
          duration: 30,
          postLimit: 10,
          priority: 1,
          features: ["Đăng 10 tin", "Hiển thị ưu tiên", "Hỗ trợ 24/7"],
          description: "Gói phù hợp cho chủ nhà có ít phòng",
          color: "#silver",
          sortOrder: 2,
        },
        {
          type: "gold",
          name: "Gói Vàng",
          price: 100000,
          duration: 30,
          postLimit: 25,
          priority: 2,
          features: ["Đăng 25 tin", "Hiển thị VIP", "Tin nổi bật", "Hỗ trợ ưu tiên"],
          description: "Gói phổ biến nhất cho chủ nhà",
          color: "#gold",
          sortOrder: 3,
        },
        {
          type: "platinum",
          name: "Gói Bạch Kim",
          price: 200000,
          duration: 30,
          postLimit: 50,
          priority: 3,
          features: ["Đăng 50 tin", "Hiển thị TOP", "Tin nổi bật", "Phân tích chi tiết", "Hỗ trợ VIP 24/7"],
          description: "Gói cao cấp nhất cho doanh nghiệp",
          color: "#platinum",
          sortOrder: 4,
        },
      ]);
      console.log("✅ Package plans seeded successfully");
    }
  } catch (error) {
    console.error("❌ Error seeding package plans:", error);
  }
};

// Gọi seed khi import
seedPackages();

export default PackagePlan;