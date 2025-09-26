import mongoose from "mongoose";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";
import jwt from "jsonwebtoken";

const simpleAPITest = async () => {
  try {
    console.log('🧪 Simple API Test...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name}`);

    // 2. Test dashboard service directly
    console.log('\n🔧 Testing dashboard service...');
    const dashboardService = (await import('../services/dashboardService.js')).default;
    
    const overview = await dashboardService.getDashboardOverview(landlord._id);
    console.log('✅ Dashboard service response:');
    console.log(`   - Total Posts: ${overview.stats.totalPosts}`);
    console.log(`   - Total Views: ${overview.stats.totalViews}`);
    console.log(`   - Active Posts: ${overview.stats.activePosts}`);
    console.log(`   - Pending Requests: ${overview.stats.pendingRequests}`);

    // 3. Test with curl command
    console.log('\n🌐 Testing with curl command...');
    const JWT_SECRET = process.env.JWT_SECRET || 'asdfsadfsadf';
    const token = jwt.sign(
      { id: landlord._id, email: landlord.email, role: landlord.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`🔑 Token: ${token.substring(0, 50)}...`);
    console.log(`📋 Curl command:`);
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/v1/dashboard/overview`);

    console.log('\n🎉 Simple API test completed!');

  } catch (error) {
    console.error('❌ Error in simple API test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
connectDB().then(() => simpleAPITest());

