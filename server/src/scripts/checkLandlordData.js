import mongoose from "mongoose";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const checkLandlordData = async () => {
  try {
    console.log('🔍 Checking landlord data for landlord@test.com...');

    // 1. Check if landlord user exists
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }
    console.log('✅ Landlord user found:', landlord.full_name, landlord.email);

    // 2. Check payments for this landlord
    const payments = await Payment.find({ user: landlord._id });
    console.log(`📊 Payments for landlord: ${payments.length}`);
    payments.forEach(payment => {
      console.log(`   - ${payment.packageName} (${payment.status}) - ${payment.amount} VND`);
    });

    // 3. Check saved properties (favorites) for this landlord
    const favorites = await Favorite.find({ user: landlord._id }).populate('post room');
    console.log(`💾 Saved properties for landlord: ${favorites.length}`);
    favorites.forEach(fav => {
      console.log(`   - Post: ${fav.post?.title || 'N/A'}`);
      console.log(`   - Room: ${fav.room?.title || 'N/A'}`);
      console.log(`   - Saved at: ${fav.savedAt}`);
    });

    // 4. Check all posts in database
    const allPosts = await Post.find({}).populate('roomId landlord');
    console.log(`📝 Total posts in database: ${allPosts.length}`);
    allPosts.forEach(post => {
      console.log(`   - ${post.title} (${post.status}) - Landlord: ${post.landlord?.email || 'N/A'}`);
    });

    // 5. Check all rooms in database
    const allRooms = await Room.find({}).populate('landlord');
    console.log(`🏠 Total rooms in database: ${allRooms.length}`);
    allRooms.forEach(room => {
      console.log(`   - ${room.title} - Landlord: ${room.landlord?.email || 'N/A'}`);
    });

    // 6. Check all users
    const allUsers = await User.find({});
    console.log(`👥 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   - ${user.full_name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('🎉 Data check completed!');

  } catch (error) {
    console.error('❌ Error checking landlord data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the check
connectDB().then(() => checkLandlordData());



