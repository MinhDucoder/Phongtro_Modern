import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "../models/roomSchema.js"; // đường dẫn schema bạn vừa viết

dotenv.config(); // để đọc MONGODB_URI trong .env

// 1. Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// 2. Seed data
const seedRooms = async () => {
  try {
    const rooms = [
      {
        title: "Phòng trọ quận 1",
        description: "Phòng rộng rãi, gần trung tâm.",
        city: "Hồ Chí Minh",
        address: "123 Lê Lợi, Quận 1",
        price: 3500000,
        area: 20,
        images: ["https://example.com/phong1.jpg"],
        amenities: ["wifi", "máy lạnh", "WC riêng"],
        landlord: new mongoose.Types.ObjectId(), // test tạm, sau có User thì thay id thật
      },
      {
        title: "Phòng trọ Cầu Giấy",
        description: "Phòng giá rẻ, gần trường học.",
        city: "Hà Nội",
        address: "456 Trần Duy Hưng, Cầu Giấy",
        price: 2500000,
        area: 18,
        images: ["https://example.com/phong2.jpg"],
        amenities: ["wifi", "máy giặt"],
        landlord: new mongoose.Types.ObjectId(),
      },
    ];

    // Xóa dữ liệu cũ (nếu muốn reset)
    await Room.deleteMany({});
    console.log("🗑️ Đã xóa dữ liệu cũ");

    // Thêm mới
    await Room.insertMany(rooms);
    console.log("✅ Seed rooms thành công!");

    process.exit(); // thoát script
  } catch (error) {
    console.error("❌ Lỗi khi seed:", error);
    process.exit(1);
  }
};

// Run
await connectDB();
await seedRooms();
