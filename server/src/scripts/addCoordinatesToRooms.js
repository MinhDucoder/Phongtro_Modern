import mongoose from "mongoose";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const addCoordinatesToRooms = async () => {
  try {
    console.log('🗺️ Adding coordinates to rooms...');

    // Lấy tất cả rooms chưa có tọa độ
    const rooms = await Room.find({ 
      $or: [
        { 'coordinate.lat': { $exists: false } },
        { 'coordinate.lng': { $exists: false } },
        { 'coordinate.lat': null },
        { 'coordinate.lng': null }
      ]
    });

    console.log(`Found ${rooms.length} rooms without coordinates`);

    // Tọa độ mẫu cho Hà Nội và TP.HCM
    const sampleCoordinates = [
      { lat: 21.0285, lng: 105.8542 }, // Hà Nội center
      { lat: 21.0245, lng: 105.8412 }, // Hà Nội - Cầu Giấy
      { lat: 21.0325, lng: 105.8612 }, // Hà Nội - Đống Đa
      { lat: 10.8231, lng: 106.6297 }, // TP.HCM center
      { lat: 10.7769, lng: 106.7009 }, // TP.HCM - Quận 1
      { lat: 10.7626, lng: 106.6602 }, // TP.HCM - Quận 3
    ];

    let updatedCount = 0;
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const coordIndex = i % sampleCoordinates.length;
      const coordinates = sampleCoordinates[coordIndex];

      await Room.findByIdAndUpdate(room._id, {
        coordinate: {
          lat: coordinates.lat,
          lng: coordinates.lng
        }
      });

      console.log(`✅ Updated room "${room.title}" with coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      updatedCount++;
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} rooms with coordinates`);

    // Hiển thị danh sách rooms với tọa độ
    const roomsWithCoords = await Room.find({ 
      'coordinate.lat': { $exists: true },
      'coordinate.lng': { $exists: true }
    });

    console.log('\n📋 Rooms with coordinates:');
    roomsWithCoords.forEach(room => {
      console.log(`- ${room.title} (${room._id}): ${room.coordinate.lat}, ${room.coordinate.lng}`);
    });

  } catch (error) {
    console.error('❌ Error adding coordinates:', error);
  }
};

// Run
await connectDB();
await addCoordinatesToRooms();
process.exit();

