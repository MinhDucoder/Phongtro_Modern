import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const createValidToken = async () => {
  try {
    console.log('🔑 Creating valid JWT token...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Generate JWT token with correct secret
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    const token = jwt.sign(
      { 
        id: landlord._id, 
        email: landlord.email,
        role: landlord.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Generated valid JWT token');
    console.log(`User: ${landlord.full_name} (${landlord.email})`);
    console.log(`Role: ${landlord.role}`);
    console.log(`Token: ${token}`);
    console.log(`\n🔗 Test URLs:`);
    console.log(`Payment History: http://localhost:5000/api/v1/payments/dashboard/history`);
    console.log(`Saved Properties: http://localhost:5000/api/v1/saved-properties/dashboard/saved`);
    console.log(`\n📋 Use this token in Authorization header:`);
    console.log(`Authorization: Bearer ${token}`);

  } catch (error) {
    console.error('❌ Error creating token:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
connectDB().then(() => createValidToken());
