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
    postDuration: {
      type: Number, // số ngày mỗi tin đăng tồn tại (7, 15, 30, 60, 90...)
      required: true,
      default: 30,
    },
    allowExtension: {
      type: Boolean, // cho phép gia hạn tin không
      default: true,
    },
    maxExtensions: {
      type: Number, // số lần gia hạn tối đa
      default: 3,
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
          duration: 30, // Gói có hiệu lực 30 ngày
          postLimit: 3, // Được đăng 3 tin
          postDuration: 7, // Mỗi tin tồn tại 7 ngày
          allowExtension: false, // Không cho gia hạn
          maxExtensions: 0,
          priority: 0,
          features: ["Đăng 3 tin miễn phí", "Mỗi tin hiển thị 7 ngày", "Hiển thị cơ bản"],
          description: "Gói miễn phí cho người dùng mới",
          color: "#gray-500",
          sortOrder: 1,
        },
        {
          type: "silver",
          name: "Gói Bạc",
          price: 50000,
          duration: 30, // Gói có hiệu lực 30 ngày
          postLimit: 10, // Được đăng 10 tin
          postDuration: 30, // Mỗi tin tồn tại 30 ngày
          allowExtension: true, // Cho phép gia hạn
          maxExtensions: 2, // Gia hạn tối đa 2 lần
          priority: 1,
          features: ["Đăng 10 tin", "Mỗi tin hiển thị 30 ngày", "Gia hạn 2 lần", "Hiển thị ưu tiên", "Hỗ trợ 24/7"],
          description: "Gói phù hợp cho chủ nhà có ít phòng",
          color: "#silver",
          sortOrder: 2,
        },
        {
          type: "gold",
          name: "Gói Vàng",
          price: 100000,
          duration: 90, // Gói có hiệu lực 90 ngày
          postLimit: 30, // Được đăng 30 tin
          postDuration: 60, // Mỗi tin tồn tại 60 ngày
          allowExtension: true, // Cho phép gia hạn
          maxExtensions: 3, // Gia hạn tối đa 3 lần
          priority: 2,
          features: ["Đăng 30 tin", "Mỗi tin hiển thị 60 ngày", "Gia hạn 3 lần", "Hiển thị VIP", "Tin nổi bật", "Hỗ trợ ưu tiên"],
          description: "Gói phổ biến nhất cho chủ nhà",
          color: "#gold",
          sortOrder: 3,
        },
        {
          type: "platinum",
          name: "Gói Bạch Kim",
          price: 200000,
          duration: 180, // Gói có hiệu lực 180 ngày (6 tháng)
          postLimit: 100, // Được đăng 100 tin
          postDuration: 90, // Mỗi tin tồn tại 90 ngày
          allowExtension: true, // Cho phép gia hạn
          maxExtensions: 5, // Gia hạn tối đa 5 lần
          priority: 3,
          features: ["Đăng 100 tin", "Mỗi tin hiển thị 90 ngày", "Gia hạn 5 lần", "Hiển thị TOP", "Tin nổi bật", "Phân tích chi tiết", "Hỗ trợ VIP 24/7"],
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