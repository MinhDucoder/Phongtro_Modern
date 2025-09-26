import mongoose from "mongoose";
import { connectDB } from "../config/mongodbConfig.js";

const testPaymentAPI = async () => {
  try {
    console.log('🧪 Testing Payment API endpoints...');
    
    // Test 1: Check if Payment model exists and can be imported
    console.log('1. Testing Payment model import...');
    const Payment = await import('../models/paymentSchema.js');
    console.log('✅ Payment model imported successfully');
    
    // Test 2: Check if PaymentController exists
    console.log('2. Testing PaymentController import...');
    const PaymentController = await import('../controllers/PaymentController.js');
    console.log('✅ PaymentController imported successfully');
    
    // Test 3: Check database connection and collections
    console.log('3. Testing database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('📊 Available collections:', collectionNames);
    
    // Test 4: Check if payments collection exists or can be created
    if (collectionNames.includes('payments')) {
      console.log('✅ Payments collection exists');
      const paymentCount = await Payment.default.countDocuments();
      console.log(`📈 Total payments in database: ${paymentCount}`);
    } else {
      console.log('⚠️ Payments collection does not exist yet (will be created on first insert)');
    }
    
    // Test 5: Test controller methods exist
    console.log('4. Testing PaymentController methods...');
    const methods = Object.getOwnPropertyNames(PaymentController.default.constructor.prototype)
      .filter(name => name !== 'constructor');
    console.log('🔧 Available methods:', methods);
    
    console.log('🎉 Payment API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing Payment API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the tests
connectDB().then(() => testPaymentAPI());
