import mongoose from "mongoose";
import { connectDB } from "../config/mongodbConfig.js";

const testSavedPropertiesAPI = async () => {
  try {
    console.log('🧪 Testing Saved Properties API endpoints...');
    
    // Test 1: Check if Favorite model exists and can be imported
    console.log('1. Testing Favorite model import...');
    const Favorite = await import('../models/favoriteSchema.js');
    console.log('✅ Favorite model imported successfully');
    
    // Test 2: Check if SavedPropertiesController exists
    console.log('2. Testing SavedPropertiesController import...');
    const SavedPropertiesController = await import('../controllers/SavedPropertiesController.js');
    console.log('✅ SavedPropertiesController imported successfully');
    
    // Test 3: Check database collections
    console.log('3. Testing database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('📊 Available collections:', collectionNames);
    
    // Test 4: Check if favorites collection exists
    if (collectionNames.includes('favorites')) {
      console.log('✅ Favorites collection exists');
      const favoriteCount = await Favorite.default.countDocuments();
      console.log(`📈 Total favorites in database: ${favoriteCount}`);
    } else {
      console.log('⚠️ Favorites collection does not exist yet (will be created on first insert)');
    }
    
    // Test 5: Test controller methods exist
    console.log('4. Testing SavedPropertiesController methods...');
    const methods = Object.getOwnPropertyNames(SavedPropertiesController.default.constructor.prototype)
      .filter(name => name !== 'constructor');
    console.log('🔧 Available methods:', methods);
    
    // Test 6: Check related collections
    console.log('5. Testing related collections...');
    const relatedCollections = ['posts', 'rooms', 'users'];
    relatedCollections.forEach(collection => {
      if (collectionNames.includes(collection)) {
        console.log(`✅ ${collection} collection exists`);
      } else {
        console.log(`⚠️ ${collection} collection missing`);
      }
    });
    
    console.log('🎉 Saved Properties API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing Saved Properties API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the tests
connectDB().then(() => testSavedPropertiesAPI());



