import mongoose from "mongoose";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const clearAndReseedData = async () => {
  try {
    console.log('🧹 Starting to clear and reseed data...');

    // 1. Clear existing data for test users
    await Payment.deleteMany({});
    await Favorite.deleteMany({});
    await Post.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({ email: { $in: ['landlord@test.com', 'otherlandlord@test.com', 'tenant@test.com'] } });
    
    console.log('✅ Cleared existing test data');

    // 2. Now run the seeding scripts
    console.log('🌱 Reseeding data...');
    
    // Import and run seedLandlordData
    const { default: seedLandlordData } = await import('./seedLandlordData.js');
    await seedLandlordData();
    
    // Import and run seedMorePosts  
    const { default: seedMorePosts } = await import('./seedMorePosts.js');
    await seedMorePosts();

    console.log('🎉 Clear and reseed completed!');

  } catch (error) {
    console.error('❌ Error in clear and reseed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the clear and reseed
connectDB().then(() => clearAndReseedData());



