import mongoose from 'mongoose';
import Room from '../models/roomSchema.js';
import Post from '../models/postSchema.js';

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_modern');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hàm cập nhật propertyType cho Room
const updateRoomPropertyTypes = async () => {
  try {
    console.log('Updating Room propertyTypes...');
    
    // Cập nhật tất cả rooms chưa có propertyType
    const result = await Room.updateMany(
      { propertyType: { $exists: false } },
      { $set: { propertyType: 'phong_tro' } }
    );
    
    console.log(`Updated ${result.modifiedCount} rooms with default propertyType`);
    
    // Cập nhật một số rooms với propertyType khác nhau dựa trên title hoặc description
    const rooms = await Room.find({ propertyType: 'phong_tro' });
    
    for (const room of rooms) {
      let newPropertyType = 'phong_tro';
      
      // Phân loại dựa trên title và description
      const title = (room.title || '').toLowerCase();
      const description = (room.description || '').toLowerCase();
      
      if (title.includes('căn hộ') || title.includes('can ho') || description.includes('căn hộ') || description.includes('can ho')) {
        newPropertyType = 'can_ho';
      } else if (title.includes('nhà nguyên căn') || title.includes('nha nguyen can') || description.includes('nhà nguyên căn') || description.includes('nha nguyen can')) {
        newPropertyType = 'nha_nguyen_can';
      } else if (title.includes('chung cư') || title.includes('chung cu') || description.includes('chung cư') || description.includes('chung cu')) {
        newPropertyType = 'chung_cu';
      } else if (title.includes('nhà trọ') || title.includes('nha tro') || description.includes('nhà trọ') || description.includes('nha tro')) {
        newPropertyType = 'nha_tro';
      }
      
      if (newPropertyType !== 'phong_tro') {
        await Room.findByIdAndUpdate(room._id, { propertyType: newPropertyType });
        console.log(`Updated room ${room._id} to ${newPropertyType}`);
      }
    }
    
    console.log('Room propertyTypes updated successfully');
  } catch (error) {
    console.error('Error updating Room propertyTypes:', error);
  }
};

// Hàm cập nhật propertyType cho Post
const updatePostPropertyTypes = async () => {
  try {
    console.log('Updating Post propertyTypes...');
    
    // Cập nhật tất cả posts chưa có propertyType
    const result = await Post.updateMany(
      { propertyType: { $exists: false } },
      { $set: { propertyType: 'phong_tro' } }
    );
    
    console.log(`Updated ${result.modifiedCount} posts with default propertyType`);
    
    // Cập nhật posts dựa trên roomId
    const posts = await Post.find({ propertyType: 'phong_tro' }).populate('roomId');
    
    for (const post of posts) {
      if (post.roomId && post.roomId.propertyType) {
        await Post.findByIdAndUpdate(post._id, { 
          propertyType: post.roomId.propertyType,
          roomType: post.roomId.roomType 
        });
        console.log(`Updated post ${post._id} to ${post.roomId.propertyType}`);
      }
    }
    
    console.log('Post propertyTypes updated successfully');
  } catch (error) {
    console.error('Error updating Post propertyTypes:', error);
  }
};

// Hàm tạo dữ liệu mẫu
const createSampleData = async () => {
  try {
    console.log('Creating sample data...');
    
    // Tạo một số rooms mẫu với propertyType khác nhau
    const sampleRooms = [
      {
        title: 'Phòng trọ đẹp gần trường đại học',
        description: 'Phòng trọ sạch sẽ, có wifi, điều hòa',
        city: 'Hà Nội',
        address: '123 Đường ABC',
        price: 2000000,
        area: 25,
        propertyType: 'phong_tro',
        roomType: 'phong_don',
        amenities: ['wifi', 'aircon'],
        landlord: new mongoose.Types.ObjectId()
      },
      {
        title: 'Căn hộ 2 phòng ngủ hiện đại',
        description: 'Căn hộ đầy đủ tiện nghi, gần trung tâm',
        city: 'TP.HCM',
        address: '456 Đường XYZ',
        price: 15000000,
        area: 80,
        propertyType: 'can_ho',
        roomType: 'can_ho_2_phong',
        amenities: ['wifi', 'aircon', 'washing_machine'],
        landlord: new mongoose.Types.ObjectId()
      },
      {
        title: 'Nhà nguyên căn 3 tầng',
        description: 'Nhà nguyên căn rộng rãi, phù hợp gia đình',
        city: 'Đà Nẵng',
        address: '789 Đường DEF',
        price: 25000000,
        area: 150,
        propertyType: 'nha_nguyen_can',
        roomType: 'nha_3_tang',
        amenities: ['wifi', 'aircon', 'washing_machine', 'fridge'],
        landlord: new mongoose.Types.ObjectId()
      }
    ];
    
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`Created ${createdRooms.length} sample rooms`);
    
    // Tạo posts tương ứng
    const samplePosts = createdRooms.map(room => ({
      roomId: room._id,
      landlord: room.landlord,
      propertyType: room.propertyType,
      roomType: room.roomType,
      status: 'active',
      favouriteLevel: 'free'
    }));
    
    const createdPosts = await Post.insertMany(samplePosts);
    console.log(`Created ${createdPosts.length} sample posts`);
    
    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    await connectDB();
    
    console.log('Starting property type update process...');
    
    // Cập nhật dữ liệu hiện có
    await updateRoomPropertyTypes();
    await updatePostPropertyTypes();
    
    // Tạo dữ liệu mẫu
    await createSampleData();
    
    console.log('Property type update process completed successfully!');
    
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Chạy script
main();
