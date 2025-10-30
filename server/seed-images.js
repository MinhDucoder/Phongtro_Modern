import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './src/models/roomSchema.js';

dotenv.config();

// Sample Cloudinary images (phòng trọ Việt Nam)
const sampleImages = [
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
];

async function seedImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả rooms không có images hoặc images rỗng
    const rooms = await Room.find({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });

    console.log(`📊 Found ${rooms.length} rooms without images`);

    for (const room of rooms) {
      // Random 2-4 ảnh
      const numImages = Math.floor(Math.random() * 3) + 2; // 2-4
      const randomImages = [];
      
      for (let i = 0; i < numImages; i++) {
        const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        randomImages.push({
          url: randomImg,
          public_id: `phongtro/${room._id}_${i}`
        });
      }

      room.images = randomImages;
      await room.save();
      console.log(`✅ Added ${numImages} images to room: ${room.title}`);
    }

    console.log('🎉 Done seeding images!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedImages();
