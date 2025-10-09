import mongoose from "mongoose";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const createTestRoom = async () => {
  try {
    console.log('🏠 Creating test room with coordinates...');

    // Tìm user landlord để gán cho room
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // Tạo room mới với tọa độ
    const testRoom = new Room({
      title: 'Phòng trọ test với tọa độ',
      description: 'Phòng trọ test để kiểm tra SimpleMap component',
      price: 3000000,
      area: 25,
      address: '123 Nguyễn Huệ, Quận 1',
      city: 'TP. Hồ Chí Minh',
      images: ['/placeholder-room.svg'],
      amenities: ['wifi', 'aircon', 'private_wc'],
      landlord: landlord._id,
      isAvailable: true,
      coordinate: {
        lat: 10.7769, // Tọa độ Quận 1, TP.HCM
        lng: 106.7009
      }
    });

    const savedRoom = await testRoom.save();
    console.log('✅ Test room created successfully!');
    console.log(`- Room ID: ${savedRoom._id}`);
    console.log(`- Title: ${savedRoom.title}`);
    console.log(`- Coordinates: ${savedRoom.coordinate.lat}, ${savedRoom.coordinate.lng}`);
    console.log(`- Address: ${savedRoom.address}`);

    return savedRoom._id;

  } catch (error) {
    console.error('❌ Error creating test room:', error);
  }
};

// Run
await connectDB();
await createTestRoom();
process.exit();

