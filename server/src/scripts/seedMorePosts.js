import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import Favorite from "../models/favoriteSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const seedMorePosts = async () => {
  try {
    console.log('🌱 Starting to seed more posts and saved properties...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Create another landlord user
    let otherLandlord = await User.findOne({ email: 'otherlandlord@test.com' });
    if (!otherLandlord) {
      otherLandlord = await User.create({
        full_name: 'Chủ nhà Khác',
        email: 'otherlandlord@test.com',
        password: 'hashedpassword',
        phone: '0999888777',
        role: 'landlord',
        is_verified: true
      });
      console.log('✅ Created other landlord user');
    }

    // 3. Create rooms for other landlord
    const otherRooms = await Room.create([
      {
        title: 'Phòng trọ view sông, thoáng mát',
        description: 'Phòng trọ có view sông đẹp, thoáng mát, phù hợp làm việc từ xa',
        price: 3800000,
        area: 30,
        address: 'Số 999, Phố Bạch Đằng',
        city: 'Hà Nội',
        district: 'Hoàn Kiếm',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
        amenities: ['wifi', 'aircon', 'balcony'],
        landlord: otherLandlord._id
      },
      {
        title: 'Căn hộ studio hiện đại, gần metro',
        description: 'Căn hộ studio hiện đại, gần ga metro, thuận tiện di chuyển',
        price: 6200000,
        area: 40,
        address: 'Số 888, Đường Láng',
        city: 'Hà Nội',
        district: 'Đống Đa',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
        amenities: ['wifi', 'aircon', 'fridge', 'washing_machine'],
        landlord: otherLandlord._id
      }
    ]);
    console.log(`✅ Created ${otherRooms.length} rooms for other landlord`);

    // 4. Create posts for other landlord
    const otherPosts = await Post.create([
      {
        roomId: otherRooms[0]._id,
        landlord: otherLandlord._id,
        status: 'active',
        views: 156,
        favouriteLevel: 'silver',
        title: 'Phòng trọ view sông, thoáng mát',
        description: 'Phòng trọ có view sông đẹp, thoáng mát, phù hợp làm việc từ xa'
      },
      {
        roomId: otherRooms[1]._id,
        landlord: otherLandlord._id,
        status: 'active',
        views: 298,
        favouriteLevel: 'gold',
        title: 'Căn hộ studio hiện đại, gần metro',
        description: 'Căn hộ studio hiện đại, gần ga metro, thuận tiện di chuyển'
      }
    ]);
    console.log(`✅ Created ${otherPosts.length} posts for other landlord`);

    // 5. Create saved properties for main landlord
    await Favorite.deleteMany({ user: landlord._id });
    const favorites = await Favorite.create([
      {
        user: landlord._id,
        post: otherPosts[0]._id,
        room: otherRooms[0]._id,
        savedAt: new Date('2024-01-20'),
        notes: 'Phòng này có view đẹp, tham khảo cách setup',
        tags: ['view-đẹp', 'tham-khảo']
      },
      {
        user: landlord._id,
        post: otherPosts[1]._id,
        room: otherRooms[1]._id,
        savedAt: new Date('2024-01-19'),
        notes: 'Gần metro, vị trí tốt để học hỏi',
        tags: ['gần-metro', 'vị-trí-tốt']
      }
    ]);
    console.log(`✅ Created ${favorites.length} saved properties for main landlord`);

    console.log('🎉 More posts and saved properties seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding more posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedMorePosts());
