import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const debugAnalyticsData = async () => {
  try {
    console.log('🔍 Debugging Analytics Data...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name}`);

    // 2. Get user's posts
    const posts = await Post.find({ landlord: landlord._id });
    console.log(`\n📝 User posts: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log(`First post ID: ${posts[0]._id}`);
      console.log(`First post roomId: ${posts[0].roomId}`);
    }

    // 3. Get analytics data
    const analytics = await PostAnalytics.find({ landlord: landlord._id });
    console.log(`\n📊 Analytics records: ${analytics.length}`);
    
    if (analytics.length > 0) {
      console.log(`First analytics record:`);
      console.log(`  - Post ID: ${analytics[0].post}`);
      console.log(`  - Date: ${analytics[0].date}`);
      console.log(`  - Views: ${analytics[0].metrics.views}`);
      console.log(`  - Likes: ${analytics[0].metrics.likes}`);
      console.log(`  - Calls: ${analytics[0].metrics.calls}`);
      console.log(`  - Messages: ${analytics[0].metrics.messages}`);
    }

    // 4. Check if post IDs match
    const postIds = posts.map(post => post._id);
    console.log(`\n🔗 Post IDs: ${postIds.map(id => id.toString()).join(', ')}`);
    
    const analyticsPostIds = analytics.map(a => a.post.toString());
    console.log(`📊 Analytics Post IDs: ${analyticsPostIds.join(', ')}`);

    // 5. Test aggregation
    console.log(`\n🧪 Testing aggregation...`);
    try {
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
    } catch (error) {
      console.error(`❌ Aggregation error: ${error.message}`);
    }

    // 6. Check if analytics have correct post references
    console.log(`\n🔍 Checking post references...`);
    const postsWithAnalytics = posts.filter(post => 
      analytics.some(a => a.post.toString() === post._id.toString())
    );
    console.log(`Posts with analytics: ${postsWithAnalytics.length}/${posts.length}`);

    // 7. Manual calculation
    console.log(`\n🧮 Manual calculation...`);
    let totalViews = 0;
    let totalLikes = 0;
    let totalCalls = 0;
    let totalMessages = 0;
    
    analytics.forEach(a => {
      totalViews += a.metrics.views;
      totalLikes += a.metrics.likes;
      totalCalls += a.metrics.calls;
      totalMessages += a.metrics.messages;
    });
    
    console.log(`Total Views: ${totalViews}`);
    console.log(`Total Likes: ${totalLikes}`);
    console.log(`Total Calls: ${totalCalls}`);
    console.log(`Total Messages: ${totalMessages}`);

    console.log('\n🎉 Analytics debug completed!');

  } catch (error) {
    console.error('❌ Error debugging analytics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the debug
connectDB().then(() => debugAnalyticsData());
