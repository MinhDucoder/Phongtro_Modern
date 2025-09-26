import mongoose from "mongoose";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const clearTestData = async () => {
  try {
    console.log('🧹 Starting to clear test data...');

    // Clear all test data
    await Payment.deleteMany({});
    await Favorite.deleteMany({});
    await Post.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({ 
      email: { $in: ['landlord@test.com', 'otherlandlord@test.com', 'tenant@test.com'] } 
    });
    
    console.log('✅ Cleared all test data');

  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the clear
connectDB().then(() => clearTestData());

