import mongoose from "mongoose";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixAllRoomCoordinates = async () => {
  try {
    console.log('🔧 Fixing coordinates for all rooms...');

    // Lấy tất cả rooms chưa có tọa độ
    const roomsWithoutCoords = await Room.find({ 
      $or: [
        { 'coordinate.lat': { $exists: false } },
        { 'coordinate.lng': { $exists: false } },
        { 'coordinate.lat': null },
        { 'coordinate.lng': null }
      ]
    });

    console.log(`Found ${roomsWithoutCoords.length} rooms without coordinates`);

    if (roomsWithoutCoords.length === 0) {
      console.log('✅ All rooms already have coordinates!');
      return;
    }

    // Tọa độ mẫu cho các thành phố
    const cityCoordinates = {
      'Hà Nội': { lat: 21.0285, lng: 105.8542 },
      'Hồ Chí Minh': { lat: 10.8231, lng: 106.6297 },
      'TP. Hồ Chí Minh': { lat: 10.8231, lng: 106.6297 },
      'TP.HCM': { lat: 10.8231, lng: 106.6297 },
      'Đà Nẵng': { lat: 16.0544, lng: 108.2022 },
      'Cần Thơ': { lat: 10.0452, lng: 105.7469 },
      'Hải Phòng': { lat: 20.8449, lng: 106.6881 }
    };

    let updatedCount = 0;
    for (const room of roomsWithoutCoords) {
      let coordinates;
      
      // Thử lấy tọa độ dựa trên city
      if (room.city && cityCoordinates[room.city]) {
        coordinates = cityCoordinates[room.city];
      } else {
        // Mặc định là TP.HCM
        coordinates = { lat: 10.8231, lng: 106.6297 };
      }

      await Room.findByIdAndUpdate(room._id, {
        coordinate: coordinates
      });

      console.log(`✅ Updated room "${room.title}" (${room.city || 'Unknown'}) with coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      updatedCount++;
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} rooms with coordinates`);

    // Hiển thị thống kê
    const totalRooms = await Room.countDocuments();
    const roomsWithCoords = await Room.countDocuments({ 
      'coordinate.lat': { $exists: true },
      'coordinate.lng': { $exists: true }
    });

    console.log(`\n📊 Statistics:`);
    console.log(`- Total rooms: ${totalRooms}`);
    console.log(`- Rooms with coordinates: ${roomsWithCoords}`);
    console.log(`- Rooms without coordinates: ${totalRooms - roomsWithCoords}`);

  } catch (error) {
    console.error('❌ Error fixing room coordinates:', error);
  }
};

// Run
await connectDB();
await fixAllRoomCoordinates();
process.exit();

