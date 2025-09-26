import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Room from "../models/roomSchema.js";
import Post from "../models/postSchema.js";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const checkFinalData = async () => {
  try {
    console.log('📊 Checking final data for landlord@test.com...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Check rooms
    const rooms = await Room.find({ landlord: landlord._id });
    console.log(`\n🏠 Rooms (${rooms.length}):`);
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.title} - ${room.price.toLocaleString()} VND`);
    });

    // 3. Check posts
    const posts = await Post.find({ landlord: landlord._id });
    console.log(`\n📝 Posts (${posts.length}):`);
    posts.forEach((post, index) => {
      const price = post.price ? post.price.toLocaleString() : 'N/A';
      console.log(`${index + 1}. ${post.title} - ${price} VND - ${post.status}`);
    });

    // 4. Check payments
    const payments = await Payment.find({ user: landlord._id }).sort({ createdAt: -1 });
    console.log(`\n💳 Payments (${payments.length}):`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.packageName} - ${payment.status} - ${payment.amount.toLocaleString()} VND`);
    });

    // 5. Check saved properties
    const favorites = await Favorite.find({ user: landlord._id })
      .populate('post room')
      .sort({ savedAt: -1 });
    console.log(`\n💾 Saved Properties (${favorites.length}):`);
    favorites.forEach((fav, index) => {
      const title = fav.post?.title || fav.room?.title || 'Unknown';
      console.log(`${index + 1}. ${title} - Saved: ${fav.savedAt.toLocaleDateString('vi-VN')}`);
    });

    // 6. Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`👤 User: ${landlord.full_name} (${landlord.email})`);
    console.log(`🏠 Total rooms: ${rooms.length}`);
    console.log(`📝 Total posts: ${posts.length}`);
    console.log(`💳 Total payments: ${payments.length}`);
    console.log(`💾 Total saved properties: ${favorites.length}`);
    
    // Payment statistics
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`💰 Completed payments: ${completedPayments.length}`);
    console.log(`💰 Total amount: ${totalAmount.toLocaleString()} VND`);

    console.log('\n🎉 Data check completed!');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the check
connectDB().then(() => checkFinalData());
