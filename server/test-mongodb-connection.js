// test-mongodb-connection.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Đọc cấu hình MongoDB từ file hoặc biến môi trường
let connectionString;

try {
  // Thử đọc từ file config
  const configPath = path.join(__dirname, 'src/config/mongodbConfig.js');
  if (fs.existsSync(configPath)) {
    console.log('Reading config from file:', configPath);
    const configContent = fs.readFileSync(configPath, 'utf-8');
    // Trích xuất URI từ nội dung file
    const match = configContent.match(/mongodb:\/\/[^'"]+/);
    if (match) {
      connectionString = match[0];
      console.log('Found connection string in config file:', connectionString);
    }
  }
} catch (err) {
  console.log('Error reading config file:', err.message);
}

// Nếu không tìm thấy trong file, thử lấy từ biến môi trường
if (!connectionString) {
  connectionString = process.env.MONGODB_URI || process.env.DB_URI;
  console.log('Using connection string from environment:', connectionString || 'Not found');
}

// Nếu vẫn không có, sử dụng giá trị mặc định
if (!connectionString) {
  // Thử kết nối đến localhost thay vì IP từ xa
  connectionString = 'mongodb://localhost:27017/phongtro';
  console.log('Using default connection string:', connectionString);
}

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', connectionString);
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000 // Giảm timeout để lỗi hiện nhanh hơn
    });
    
    console.log('MongoDB connection successful!');
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Gợi ý sửa lỗi
    console.log('\nSUGGESTIONS TO FIX:');
    console.log('1. Check if MongoDB server is running');
    console.log('2. Verify IP address and port are correct');
    console.log('3. Check network connectivity and firewall settings');
    console.log('4. Try connecting to a local MongoDB instance instead');
    console.log('5. Update your connection string in .env or config file');
    
    if (connectionString.includes('159.143.58.32')) {
      console.log('\nTry modifying the connection string to use localhost:');
      console.log('mongodb://localhost:27017/phongtro');
    }
  }
}

testConnection();