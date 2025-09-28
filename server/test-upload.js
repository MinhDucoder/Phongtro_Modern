// Test script để kiểm tra upload ảnh
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import uploadService from './src/services/uploadService.js';
import Room from './src/models/roomSchema.js';

dotenv.config();

async function testUpload() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_modern');
    console.log('✅ Connected to MongoDB');

    // Test upload service
    console.log('🧪 Testing upload service...');
    
    // Tạo một file test giả
    const testFile = {
      path: './test-image.jpg', // File test giả
      originalname: 'test.jpg'
    };

    try {
      const result = await uploadService.uploadFile(testFile.path, 'Test');
      console.log('✅ Upload service result:', result);
    } catch (error) {
      console.log('❌ Upload service error:', error.message);
    }

    // Test tạo room với ảnh
    console.log('🧪 Testing room creation with images...');
    
    const testRoom = {
      title: 'Test Room',
      description: 'Test Description',
      price: 1000000,
      address: 'Test Address',
      images: [
        {
          url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
          public_id: 'test_1234567890'
        }
      ],
      landlord: new mongoose.Types.ObjectId()
    };

    const room = await Room.create(testRoom);
    console.log('✅ Room created:', room);

    // Test lấy room
    const foundRoom = await Room.findById(room._id);
    console.log('✅ Room found:', foundRoom);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testUpload();
