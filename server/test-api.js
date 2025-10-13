// Test script để kiểm tra API
import express from 'express';
import mongoose from 'mongoose';

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/phongtro_modern')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema đơn giản
const roomSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  area: Number,
  address: String,
  city: String,
  images: [String],
  amenities: [String],
  landlord: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

// Tạo dữ liệu mẫu
const createSampleData = async () => {
  try {
    console.log('Creating sample data...');
    
    // Xóa dữ liệu cũ
    await Room.deleteMany({});
    console.log('Cleared existing data');
    
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`Created ${createdRooms.length} rooms`);
    
    // Test API
    const rooms = await Room.find({});
    console.log('Total rooms in database:', rooms.length);
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.title} - ${room.price.toLocaleString('vi-VN')} VNĐ/tháng`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createSampleData();
