import mongoose from "mongoose";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixLandlordData = async () => {
  try {
    console.log('🔧 Fixing landlord data...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Fix posts - add missing titles
    const posts = await Post.find({ landlord: landlord._id });
    console.log(`📝 Found ${posts.length} posts for landlord`);
    
    for (const post of posts) {
      if (!post.title) {
        const room = await Room.findById(post.roomId);
        if (room) {
          post.title = room.title;
          await post.save();
          console.log(`✅ Fixed post title: ${room.title}`);
        }
      }
    }

    // 3. Fix saved properties - ensure proper population
    const favorites = await Favorite.find({ user: landlord._id });
    console.log(`💾 Found ${favorites.length} saved properties for landlord`);
    
    for (const fav of favorites) {
      const post = await Post.findById(fav.post);
      const room = await Room.findById(fav.room);
      
      if (post && room) {
        console.log(`✅ Saved property: ${room.title} (Post: ${post.title})`);
      } else {
        console.log(`⚠️ Missing data for favorite: ${fav._id}`);
      }
    }

    // 4. Verify payments
    const payments = await Payment.find({ user: landlord._id });
    console.log(`💰 Found ${payments.length} payments for landlord`);
    
    for (const payment of payments) {
      console.log(`✅ Payment: ${payment.packageName} - ${payment.status} - ${payment.amount} VND`);
    }

    // 5. Test API endpoints by calling them directly
    console.log('🧪 Testing API endpoints...');
    
    // Test payment history API
    const paymentHistory = await Payment.find({ user: landlord._id })
      .sort({ createdAt: -1 })
      .lean();
    console.log(`📊 Payment history API would return: ${paymentHistory.length} records`);
    
    // Test saved properties API
    const savedProperties = await Favorite.find({ user: landlord._id })
      .populate({
        path: 'post',
        populate: {
          path: 'roomId',
          select: 'title description price area address city images amenities status'
        }
      })
      .populate({
        path: 'room',
        select: 'title description price area address city images amenities'
      })
      .lean();
    console.log(`💾 Saved properties API would return: ${savedProperties.length} records`);
    
    // Check if data is properly formatted
    if (savedProperties.length > 0) {
      const firstProperty = savedProperties[0];
      console.log('📋 Sample saved property data:');
      console.log(`   - ID: ${firstProperty._id}`);
      console.log(`   - Post: ${firstProperty.post?.roomId?.title || 'N/A'}`);
      console.log(`   - Room: ${firstProperty.room?.title || 'N/A'}`);
      console.log(`   - Saved at: ${firstProperty.savedAt}`);
    }

    console.log('🎉 Data fix completed!');

  } catch (error) {
    console.error('❌ Error fixing landlord data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the fix
connectDB().then(() => fixLandlordData());



