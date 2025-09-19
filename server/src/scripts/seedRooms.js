import mongoose from 'mongoose';
import roomSchema from '../models/roomSchema.js';

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";
    const clientOptions = {
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    };
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { ...clientOptions, ssl: true, tls: true });
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedRooms = async () => {
  try {
    console.log('Starting to seed rooms...');
    
    // Xóa tất cả phòng cũ
    await roomSchema.deleteMany({});
    console.log('Cleared existing rooms');
    
    // Thêm phòng mới
    const createdRooms = await roomSchema.insertMany(sampleRooms);
    console.log(`Successfully created ${createdRooms.length} rooms`);
    
    // Hiển thị danh sách phòng đã tạo
    createdRooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.title} - ${room.price.toLocaleString('vi-VN')} VNĐ/tháng`);
    });
    
  } catch (error) {
    console.error('Error seeding rooms:', error);
  }
};

// Chạy script
const runSeed = async () => {
  await connectDB();
  await seedRooms();
  console.log('Seeding completed!');
  process.exit(0);
};

runSeed();

