// Test script để kiểm tra tạo room với ảnh
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './src/models/roomSchema.js';

dotenv.config();

async function testRoomCreation() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_modern');
    console.log('✅ Connected to MongoDB');

    // Test tạo room với ảnh dạng string
    console.log('🧪 Testing room creation with string images...');
    
    const testRoom1 = {
      title: 'Test Room 1',
      description: 'Test Description 1',
      price: 1000000,
      address: 'Test Address 1',
      images: [
        'https://res.cloudinary.com/test/image/upload/v1234567890/test1.jpg',
        'https://res.cloudinary.com/test/image/upload/v1234567890/test2.jpg'
      ],
      landlord: new mongoose.Types.ObjectId()
    };

    const room1 = await Room.create(testRoom1);
    console.log('✅ Room 1 created with string images:', room1);

    // Test tạo room với ảnh dạng object
    console.log('🧪 Testing room creation with object images...');
    
    const testRoom2 = {
      title: 'Test Room 2',
      description: 'Test Description 2',
      price: 2000000,
      address: 'Test Address 2',
      images: [
        {
          url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test3.jpg',
          public_id: 'test_1234567890_3'
        },
        {
          url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test4.jpg',
          public_id: 'test_1234567890_4'
        }
      ],
      landlord: new mongoose.Types.ObjectId()
    };

    const room2 = await Room.create(testRoom2);
    console.log('✅ Room 2 created with object images:', room2);

    // Test lấy rooms
    const rooms = await Room.find();
    console.log('✅ All rooms found:', rooms.length);

    // Cleanup
    await Room.deleteMany({ title: { $regex: /^Test Room/ } });
    console.log('✅ Test rooms cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testRoomCreation();
