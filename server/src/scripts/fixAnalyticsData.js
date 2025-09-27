import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixAnalyticsData = async () => {
  try {
    console.log('🔧 Fixing Analytics Data...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name}`);

    // 2. Get current posts
    const posts = await Post.find({ landlord: landlord._id });
    console.log(`\n📝 Current posts: ${posts.length}`);

    // 3. Delete old analytics data
    const deletedAnalytics = await PostAnalytics.deleteMany({ landlord: landlord._id });
    console.log(`🗑️ Deleted old analytics: ${deletedAnalytics.deletedCount} records`);

    // 4. Create new analytics data for current posts
    console.log(`\n📊 Creating new analytics data...`);
    let createdCount = 0;
    
    for (const post of posts) {
      // Create analytics for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const analyticsData = {
          post: post._id,
          landlord: landlord._id,
          date: dateStr,
          metrics: {
            views: Math.floor(Math.random() * 200) + 50,
            uniqueViews: Math.floor(Math.random() * 150) + 30,
            likes: Math.floor(Math.random() * 20) + 5,
            calls: Math.floor(Math.random() * 10) + 2,
            messages: Math.floor(Math.random() * 15) + 3,
            rentalRequests: Math.floor(Math.random() * 5) + 1,
            shares: Math.floor(Math.random() * 8) + 1,
            avgViewDuration: Math.floor(Math.random() * 300) + 60
          },
          hourlyViews: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            views: Math.floor(Math.random() * 10)
          })),
          deviceStats: {
            mobile: Math.floor(Math.random() * 100) + 50,
            desktop: Math.floor(Math.random() * 80) + 30,
            tablet: Math.floor(Math.random() * 20) + 5
          },
          locationStats: [
            { city: 'Hà Nội', views: Math.floor(Math.random() * 50) + 20 },
            { city: 'TP.HCM', views: Math.floor(Math.random() * 40) + 15 },
            { city: 'Đà Nẵng', views: Math.floor(Math.random() * 20) + 5 }
          ],
          ageStats: {
            "18-25": Math.floor(Math.random() * 60) + 20,
            "26-35": Math.floor(Math.random() * 40) + 15,
            "36-45": Math.floor(Math.random() * 20) + 5,
            "45+": Math.floor(Math.random() * 10) + 2
          },
          revenue: Math.floor(Math.random() * 100000) + 50000,
          ctr: Math.floor(Math.random() * 5) + 1,
          conversionRate: Math.floor(Math.random() * 3) + 1
        };

        const analytics = new PostAnalytics(analyticsData);
        await analytics.save();
        createdCount++;
      }
    }

    console.log(`✅ Created ${createdCount} analytics records`);

    // 5. Verify the fix
    console.log(`\n🔍 Verifying fix...`);
    const newAnalytics = await PostAnalytics.find({ landlord: landlord._id });
    console.log(`📊 New analytics records: ${newAnalytics.length}`);
    
    if (newAnalytics.length > 0) {
      const totalViews = newAnalytics.reduce((sum, a) => sum + a.metrics.views, 0);
      const totalLikes = newAnalytics.reduce((sum, a) => sum + a.metrics.likes, 0);
      const totalCalls = newAnalytics.reduce((sum, a) => sum + a.metrics.calls, 0);
      const totalMessages = newAnalytics.reduce((sum, a) => sum + a.metrics.messages, 0);
      
      console.log(`📈 Total Views: ${totalViews}`);
      console.log(`❤️ Total Likes: ${totalLikes}`);
      console.log(`📞 Total Calls: ${totalCalls}`);
      console.log(`💬 Total Messages: ${totalMessages}`);
    }

    // 6. Test aggregation
    console.log(`\n🧪 Testing aggregation...`);
    const postIds = posts.map(post => post._id);
    const aggregationResult = await PostAnalytics.aggregate([
      { $match: { post: { $in: postIds } } },
      {
        $group: {
          _id: '$post',
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalCalls: { $sum: '$metrics.calls' },
          totalMessages: { $sum: '$metrics.messages' },
          totalRevenue: { $sum: '$revenue' },
        }
      }
    ]);
    
    console.log(`✅ Aggregation result: ${aggregationResult.length} records`);
    if (aggregationResult.length > 0) {
      console.log(`First aggregation result:`);
      console.log(`  - Post ID: ${aggregationResult[0]._id}`);
      console.log(`  - Total Views: ${aggregationResult[0].totalViews}`);
      console.log(`  - Total Likes: ${aggregationResult[0].totalLikes}`);
      console.log(`  - Total Calls: ${aggregationResult[0].totalCalls}`);
      console.log(`  - Total Messages: ${aggregationResult[0].totalMessages}`);
    }

    console.log('\n🎉 Analytics data fix completed!');

  } catch (error) {
    console.error('❌ Error fixing analytics data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the fix
connectDB().then(() => fixAnalyticsData());



