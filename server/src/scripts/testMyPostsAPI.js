import mongoose from "mongoose";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";
import jwt from "jsonwebtoken";

const testMyPostsAPI = async () => {
  try {
    console.log('🧪 Testing MyPosts API...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name}`);

    // 2. Create JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'asdfsadfsadf';
    const token = jwt.sign(
      { 
        id: landlord._id, 
        email: landlord.email, 
        role: landlord.role,
        full_name: landlord.full_name
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`🔑 Generated token: ${token.substring(0, 50)}...`);

    // 3. Test MyPosts API
    console.log('\n🧪 Testing /dashboard/posts API...');
    try {
      const response = await fetch('http://localhost:5000/api/v1/dashboard/posts?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ MyPosts API success!`);
        console.log(`   - Total posts: ${data.data?.posts?.length || 0}`);
        console.log(`   - Pagination: ${JSON.stringify(data.data?.pagination || {})}`);
        
        // Check first post for analytics
        if (data.data?.posts?.length > 0) {
          const firstPost = data.data.posts[0];
          console.log(`\n📊 First post analytics:`);
          console.log(`   - Post ID: ${firstPost._id}`);
          console.log(`   - Title: ${firstPost.roomId?.title || 'N/A'}`);
          console.log(`   - Analytics: ${JSON.stringify(firstPost.analytics || {})}`);
          console.log(`   - Views: ${firstPost.analytics?.views || 0}`);
          console.log(`   - Likes: ${firstPost.analytics?.likes || 0}`);
          console.log(`   - Calls: ${firstPost.analytics?.calls || 0}`);
          console.log(`   - Messages: ${firstPost.analytics?.messages || 0}`);
        }
      } else {
        console.log(`❌ MyPosts API failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ MyPosts API error: ${error.message}`);
    }

    // 4. Test dashboard service directly
    console.log('\n🔧 Testing dashboard service directly...');
    try {
      const dashboardService = (await import('../services/dashboardService.js')).default;
      
      const result = await dashboardService.getLandlordPosts({
        userId: landlord._id,
        page: 1,
        limit: 10,
        filters: { landlord: landlord._id },
        search: undefined
      });
      
      console.log(`✅ Dashboard service success!`);
      console.log(`   - Total posts: ${result.posts?.length || 0}`);
      console.log(`   - Pagination: ${JSON.stringify(result.pagination || {})}`);
      
      // Check first post for analytics
      if (result.posts?.length > 0) {
        const firstPost = result.posts[0];
        console.log(`\n📊 First post analytics from service:`);
        console.log(`   - Post ID: ${firstPost._id}`);
        console.log(`   - Title: ${firstPost.roomId?.title || 'N/A'}`);
        console.log(`   - Analytics: ${JSON.stringify(firstPost.analytics || {})}`);
        console.log(`   - Views: ${firstPost.analytics?.views || 0}`);
        console.log(`   - Likes: ${firstPost.analytics?.likes || 0}`);
        console.log(`   - Calls: ${firstPost.analytics?.calls || 0}`);
        console.log(`   - Messages: ${firstPost.analytics?.messages || 0}`);
      }
    } catch (error) {
      console.error('❌ Dashboard service error:', error.message);
    }

    console.log('\n🎉 MyPosts API test completed!');

  } catch (error) {
    console.error('❌ Error testing MyPosts API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
connectDB().then(() => testMyPostsAPI());

