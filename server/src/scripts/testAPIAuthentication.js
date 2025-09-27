import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const testAPIAuthentication = async () => {
  try {
    console.log('🔐 Testing API authentication...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Generate JWT token for testing
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        id: landlord._id, 
        email: landlord.email,
        role: landlord.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Generated JWT token for testing');
    console.log(`Token: ${token.substring(0, 50)}...`);

    // 3. Test API endpoints with authentication
    console.log('\n🧪 Testing API endpoints with authentication...');
    
    const baseUrl = 'http://localhost:5000';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test payment history endpoint
    try {
      const paymentResponse = await fetch(`${baseUrl}/api/v1/payments/dashboard/history`, {
        method: 'GET',
        headers: headers
      });
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('✅ Payment History API working');
        console.log(`   - Success: ${paymentData.success}`);
        console.log(`   - Payments count: ${paymentData.data?.payments?.length || 0}`);
      } else {
        console.log(`❌ Payment History API failed: ${paymentResponse.status}`);
        const errorText = await paymentResponse.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Payment History API error: ${error.message}`);
    }

    // Test saved properties endpoint
    try {
      const savedResponse = await fetch(`${baseUrl}/api/v1/saved-properties/dashboard/saved`, {
        method: 'GET',
        headers: headers
      });
      
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        console.log('✅ Saved Properties API working');
        console.log(`   - Success: ${savedData.success}`);
        console.log(`   - Properties count: ${savedData.data?.properties?.length || 0}`);
      } else {
        console.log(`❌ Saved Properties API failed: ${savedResponse.status}`);
        const errorText = await savedResponse.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Saved Properties API error: ${error.message}`);
    }

    console.log('\n🎉 Authentication testing completed!');

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
connectDB().then(() => testAPIAuthentication());



