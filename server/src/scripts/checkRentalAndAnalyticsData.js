import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import RentalRequest from "../models/rentalRequestSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const checkRentalAndAnalyticsData = async () => {
  try {
    console.log('📊 Checking rental requests and analytics data...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Check rental requests
    const rentalRequests = await RentalRequest.find({ landlord: landlord._id })
      .populate('tenant post')
      .sort({ createdAt: -1 });
    
    console.log(`\n📝 Rental Requests (${rentalRequests.length}):`);
    rentalRequests.forEach((request, index) => {
      const tenantName = request.tenant?.full_name || 'Unknown';
      const message = request.message.substring(0, 50) + '...';
      console.log(`${index + 1}. ${tenantName} - ${request.status} - "${message}"`);
      console.log(`   Expected move-in: ${request.expectedMoveIn.toLocaleDateString('vi-VN')}`);
      console.log(`   Created: ${request.createdAt.toLocaleDateString('vi-VN')}`);
    });

    // 3. Check analytics data
    const analyticsData = await PostAnalytics.find({ landlord: landlord._id })
      .populate('post')
      .sort({ createdAt: -1 });
    
    console.log(`\n📊 Analytics Data (${analyticsData.length}):`);
    analyticsData.forEach((analytics, index) => {
      const postTitle = analytics.post?.title || 'Unknown Post';
      console.log(`${index + 1}. ${postTitle}`);
      console.log(`   Date: ${analytics.date}`);
      console.log(`   Views: ${analytics.metrics.views} (Unique: ${analytics.metrics.uniqueViews})`);
      console.log(`   Likes: ${analytics.metrics.likes}, Shares: ${analytics.metrics.shares}`);
      console.log(`   Calls: ${analytics.metrics.calls}, Messages: ${analytics.metrics.messages}`);
      console.log(`   Rental Requests: ${analytics.metrics.rentalRequests}`);
      console.log(`   Avg View Duration: ${analytics.metrics.avgViewDuration}s`);
    });

    // 4. Summary statistics
    console.log('\n📈 Summary Statistics:');
    
    // Rental requests by status
    const pendingRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'pending' });
    const acceptedRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'accepted' });
    const rejectedRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'rejected' });
    const canceledRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'canceled' });
    
    console.log(`📝 Rental Requests:`);
    console.log(`   - Pending: ${pendingRequests}`);
    console.log(`   - Accepted: ${acceptedRequests}`);
    console.log(`   - Rejected: ${rejectedRequests}`);
    console.log(`   - Canceled: ${canceledRequests}`);
    
    // Analytics summary
    const totalViews = analyticsData.reduce((sum, a) => sum + a.metrics.views, 0);
    const totalLikes = analyticsData.reduce((sum, a) => sum + a.metrics.likes, 0);
    const totalShares = analyticsData.reduce((sum, a) => sum + a.metrics.shares, 0);
    const totalCalls = analyticsData.reduce((sum, a) => sum + a.metrics.calls, 0);
    const totalMessages = analyticsData.reduce((sum, a) => sum + a.metrics.messages, 0);
    const totalRentalRequests = analyticsData.reduce((sum, a) => sum + a.metrics.rentalRequests, 0);
    
    console.log(`📊 Analytics Summary:`);
    console.log(`   - Total Views: ${totalViews}`);
    console.log(`   - Total Likes: ${totalLikes}`);
    console.log(`   - Total Shares: ${totalShares}`);
    console.log(`   - Total Calls: ${totalCalls}`);
    console.log(`   - Total Messages: ${totalMessages}`);
    console.log(`   - Total Rental Requests: ${totalRentalRequests}`);

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
connectDB().then(() => checkRentalAndAnalyticsData());
