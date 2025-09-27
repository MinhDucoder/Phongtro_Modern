import mongoose from "mongoose";
import User from "../models/userSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";
import jwt from "jsonwebtoken";

const testDashboardAPI = async () => {
  try {
    console.log('🧪 Testing Dashboard API...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name} (${landlord.email})`);

    // 2. Check analytics data
    const analytics = await PostAnalytics.find({ landlord: landlord._id });
    console.log(`\n📊 Analytics records: ${analytics.length}`);
    
    if (analytics.length > 0) {
      const totalViews = analytics.reduce((sum, analytics) => sum + analytics.metrics.views, 0);
      console.log(`📈 Total views from analytics: ${totalViews}`);
      
      // Show sample analytics
      analytics.slice(0, 3).forEach((analytics, index) => {
        console.log(`${index + 1}. Date: ${analytics.date}, Views: ${analytics.metrics.views}`);
      });
    } else {
      console.log('⚠️ No analytics data found');
    }

    // 3. Test dashboard service directly
    console.log('\n🔧 Testing dashboard service...');
    const dashboardService = (await import('../services/dashboardService.js')).default;
    
    try {
      const overview = await dashboardService.getDashboardOverview(landlord._id);
      console.log('✅ Dashboard service response:');
      console.log(`   - Total Posts: ${overview.stats.totalPosts}`);
      console.log(`   - Active Posts: ${overview.stats.activePosts}`);
      console.log(`   - Total Views: ${overview.stats.totalViews}`);
      console.log(`   - Pending Requests: ${overview.stats.pendingRequests}`);
      
      if (overview.stats.totalViews > 0) {
        console.log('✅ Total views is working!');
      } else {
        console.log('⚠️ Total views is 0 - this might be the issue');
      }
    } catch (error) {
      console.error('❌ Error testing dashboard service:', error.message);
    }

    // 4. Test API endpoint with authentication
    console.log('\n🌐 Testing API endpoint...');
    
    // Create JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'asdfsadfsadf';
    const token = jwt.sign(
      { id: landlord._id, email: landlord.email, role: landlord.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`🔑 Generated token: ${token.substring(0, 20)}...`);

    // Test API call
    const baseUrl = 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/v1/dashboard/overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API response:');
      console.log(`   - Success: ${data.success}`);
      console.log(`   - Total Posts: ${data.data?.stats?.totalPosts || 'N/A'}`);
      console.log(`   - Total Views: ${data.data?.stats?.totalViews || 'N/A'}`);
      console.log(`   - Active Posts: ${data.data?.stats?.activePosts || 'N/A'}`);
      
      if (data.data?.stats?.totalViews > 0) {
        console.log('✅ API is returning total views correctly!');
      } else {
        console.log('⚠️ API is returning 0 for total views');
      }
    } else {
      console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
    }

    console.log('\n🎉 Dashboard API test completed!');

  } catch (error) {
    console.error('❌ Error testing dashboard API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
connectDB().then(() => testDashboardAPI());



