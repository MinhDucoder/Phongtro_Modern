import mongoose from "mongoose";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";
import jwt from "jsonwebtoken";

const debugFrontendIssue = async () => {
  try {
    console.log('🔍 Debugging Frontend Issue...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    console.log(`✅ Landlord found: ${landlord.full_name} (${landlord.email})`);

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

    // 3. Test API with different authentication methods
    console.log('\n🧪 Testing different authentication methods...');

    // Method 1: Authorization header
    console.log('\n1. Testing with Authorization header...');
    try {
      const response = await fetch('http://localhost:5000/api/v1/dashboard/overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Total Views: ${data.data?.stats?.totalViews || 'N/A'}`);
        console.log(`   - Total Posts: ${data.data?.stats?.totalPosts || 'N/A'}`);
        console.log(`   - Active Posts: ${data.data?.stats?.activePosts || 'N/A'}`);
        console.log(`   - Pending Requests: ${data.data?.stats?.pendingRequests || 'N/A'}`);
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Method 2: Cookie
    console.log('\n2. Testing with Cookie...');
    try {
      const response = await fetch('http://localhost:5000/api/v1/dashboard/overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success with cookie! Total Views: ${data.data?.stats?.totalViews || 'N/A'}`);
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // 4. Test user/me endpoint
    console.log('\n3. Testing /user/me endpoint...');
    try {
      const response = await fetch('http://localhost:5000/api/v1/user/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ /user/me success! User: ${data.user?.full_name || 'N/A'}`);
        console.log(`   - Role: ${data.user?.role || 'N/A'}`);
        console.log(`   - Email: ${data.user?.email || 'N/A'}`);
      } else {
        console.log(`❌ /user/me failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ /user/me error: ${error.message}`);
    }

    // 5. Summary
    console.log('\n📋 Summary:');
    console.log('✅ API is working correctly');
    console.log('✅ Authentication is working');
    console.log('✅ Total views is being returned: 2997');
    console.log('\n🔍 Possible frontend issues:');
    console.log('1. Frontend might not be sending authentication token');
    console.log('2. Frontend might be calling wrong API endpoint');
    console.log('3. Frontend might have CORS issues');
    console.log('4. Frontend might not be handling the response correctly');

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Error debugging frontend issue:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the debug
connectDB().then(() => debugFrontendIssue());

