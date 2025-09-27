import mongoose from "mongoose";
import Favorite from "../models/favoriteSchema.js";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const seedLandlordSavedProperties = async () => {
  try {
    console.log('🌱 Starting to seed landlord saved properties...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }
    console.log('✅ Found landlord user');

    // 2. Find other posts from other landlords to save
    const otherPosts = await Post.find({ 
      landlord: { $ne: landlord._id },
      status: 'active'
    }).populate('roomId').limit(5);

    if (otherPosts.length === 0) {
      console.log('⚠️ No other posts found to save');
      return;
    }

    // 3. Clear existing saved properties for this landlord
    await Favorite.deleteMany({ user: landlord._id });
    console.log('🗑️ Cleared existing saved properties');

    // 4. Create saved properties
    const favorites = await Favorite.create([
      {
        user: landlord._id,
        post: otherPosts[0]._id,
        room: otherPosts[0].roomId._id,
        savedAt: new Date('2024-01-20'),
        notes: 'Phòng này có vẻ tốt, giá hợp lý',
        tags: ['giá-tốt', 'vị-trí-đẹp']
      },
      {
        user: landlord._id,
        post: otherPosts[1]._id,
        room: otherPosts[1].roomId._id,
        savedAt: new Date('2024-01-19'),
        notes: 'Tham khảo cách bố trí phòng',
        tags: ['tham-khảo', 'bố-trí']
      },
      {
        user: landlord._id,
        post: otherPosts[2]._id,
        room: otherPosts[2].roomId._id,
        savedAt: new Date('2024-01-18'),
        notes: 'So sánh giá với phòng của mình',
        tags: ['so-sánh', 'giá']
      }
    ]);
    console.log(`✅ Created ${favorites.length} saved properties for landlord`);

    console.log('🎉 Landlord saved properties seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding landlord saved properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedLandlordSavedProperties());



