import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Room from "../models/roomSchema.js";
import Post from "../models/postSchema.js";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import RentalRequest from "../models/rentalRequestSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const checkDataConsistency = async () => {
  try {
    console.log('🔍 Checking data consistency for landlord@test.com...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name} (${landlord.email})`);

    // 2. Check Rooms
    const rooms = await Room.find({ landlord: landlord._id });
    console.log(`\n🏠 Rooms: ${rooms.length}`);
    const roomsWithIssues = rooms.filter(room => 
      !room.title || !room.price || !room.area || !room.address || !room.city
    );
    if (roomsWithIssues.length > 0) {
      console.log(`⚠️ Rooms with missing data: ${roomsWithIssues.length}`);
      roomsWithIssues.forEach(room => {
        console.log(`   - ${room.title || 'No title'}: missing ${[
          !room.title ? 'title' : '',
          !room.price ? 'price' : '',
          !room.area ? 'area' : '',
          !room.address ? 'address' : '',
          !room.city ? 'city' : ''
        ].filter(Boolean).join(', ')}`);
      });
    }

    // 3. Check Posts
    const posts = await Post.find({ landlord: landlord._id });
    console.log(`\n📝 Posts: ${posts.length}`);
    const postsWithIssues = posts.filter(post => 
      !post.title || post.title === 'undefined' || !post.price || post.price === 0
    );
    if (postsWithIssues.length > 0) {
      console.log(`⚠️ Posts with missing data: ${postsWithIssues.length}`);
      postsWithIssues.forEach(post => {
        console.log(`   - ${post.title || 'No title'}: missing ${[
          !post.title || post.title === 'undefined' ? 'title' : '',
          !post.price || post.price === 0 ? 'price' : ''
        ].filter(Boolean).join(', ')}`);
      });
    }

    // 4. Check Payments
    const payments = await Payment.find({ user: landlord._id });
    console.log(`\n💳 Payments: ${payments.length}`);
    const paymentsWithIssues = payments.filter(payment => 
      !payment.packageName || !payment.amount || !payment.status
    );
    if (paymentsWithIssues.length > 0) {
      console.log(`⚠️ Payments with missing data: ${paymentsWithIssues.length}`);
    }

    // 5. Check Saved Properties
    const favorites = await Favorite.find({ user: landlord._id });
    console.log(`\n💾 Saved Properties: ${favorites.length}`);
    const favoritesWithIssues = favorites.filter(fav => 
      !fav.post || !fav.room
    );
    if (favoritesWithIssues.length > 0) {
      console.log(`⚠️ Saved properties with missing data: ${favoritesWithIssues.length}`);
    }

    // 6. Check Rental Requests
    const rentalRequests = await RentalRequest.find({ landlord: landlord._id });
    console.log(`\n📝 Rental Requests: ${rentalRequests.length}`);
    const rentalRequestsWithIssues = rentalRequests.filter(req => 
      !req.tenant || !req.post || !req.message || !req.expectedMoveIn
    );
    if (rentalRequestsWithIssues.length > 0) {
      console.log(`⚠️ Rental requests with missing data: ${rentalRequestsWithIssues.length}`);
    }

    // 7. Check Analytics
    const analytics = await PostAnalytics.find({ landlord: landlord._id });
    console.log(`\n📊 Analytics: ${analytics.length}`);
    const analyticsWithIssues = analytics.filter(analytics => 
      !analytics.post || !analytics.date || !analytics.metrics
    );
    if (analyticsWithIssues.length > 0) {
      console.log(`⚠️ Analytics with missing data: ${analyticsWithIssues.length}`);
    }

    // 8. Check Relationships
    console.log('\n🔗 Checking relationships...');
    
    // Posts should have corresponding rooms
    const postsWithoutRooms = posts.filter(post => !post.roomId);
    console.log(`📝 Posts without rooms: ${postsWithoutRooms.length}`);
    
    // Rental requests should have valid posts and tenants
    const invalidRentalRequests = await RentalRequest.find({ 
      landlord: landlord._id,
      $or: [
        { post: { $exists: false } },
        { tenant: { $exists: false } }
      ]
    });
    console.log(`📝 Invalid rental requests: ${invalidRentalRequests.length}`);
    
    // Analytics should have valid posts
    const invalidAnalytics = await PostAnalytics.find({
      landlord: landlord._id,
      $or: [
        { post: { $exists: false } },
        { post: null }
      ]
    });
    console.log(`📊 Invalid analytics: ${invalidAnalytics.length}`);

    // 9. Data Summary
    console.log('\n📊 Data Summary:');
    console.log(`👤 User: ${landlord.full_name}`);
    console.log(`🏠 Rooms: ${rooms.length} (${roomsWithIssues.length} with issues)`);
    console.log(`📝 Posts: ${posts.length} (${postsWithIssues.length} with issues)`);
    console.log(`💳 Payments: ${payments.length} (${paymentsWithIssues.length} with issues)`);
    console.log(`💾 Saved Properties: ${favorites.length} (${favoritesWithIssues.length} with issues)`);
    console.log(`📝 Rental Requests: ${rentalRequests.length} (${rentalRequestsWithIssues.length} with issues)`);
    console.log(`📊 Analytics: ${analytics.length} (${analyticsWithIssues.length} with issues)`);

    // 10. Overall Status
    const totalIssues = roomsWithIssues.length + postsWithIssues.length + 
                       paymentsWithIssues.length + favoritesWithIssues.length + 
                       rentalRequestsWithIssues.length + analyticsWithIssues.length +
                       postsWithoutRooms.length + invalidRentalRequests.length + invalidAnalytics.length;

    if (totalIssues === 0) {
      console.log('\n✅ All data is consistent!');
    } else {
      console.log(`\n⚠️ Found ${totalIssues} data consistency issues`);
    }

    console.log('\n🎉 Data consistency check completed!');

  } catch (error) {
    console.error('❌ Error checking data consistency:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the check
connectDB().then(() => checkDataConsistency());

