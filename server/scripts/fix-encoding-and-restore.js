import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import he from 'he'; // HTML entity decoder
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models (using Schema files)
import Room from '../src/models/roomSchema.js';
import Post from '../src/models/postSchema.js';
import User from '../src/models/userSchema.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Decode HTML entities in an object recursively
const decodeObject = (obj) => {
  if (typeof obj === 'string') {
    return he.decode(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => decodeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const decoded = {};
    for (const [key, value] of Object.entries(obj)) {
      decoded[key] = decodeObject(value);
    }
    return decoded;
  }
  
  return obj;
};

// Main restore function
const restoreFromMeiliSearch = async () => {
  try {
    console.log('📖 Reading posts from MeiliSearch backup...');
    
    const jsonPath = path.join(__dirname, '../meili-backup/posts_from_meili_fixed.json');
    let rawData = fs.readFileSync(jsonPath, 'utf8');
    
    // Remove BOM if present
    if (rawData.charCodeAt(0) === 0xFEFF) {
      rawData = rawData.slice(1);
    }
    
    const posts = JSON.parse(rawData);
    
    console.log(`Found ${posts.length} posts in backup file`);
    
    // Create or get default landlord user
    let landlord = await User.findOne({ email: 'landlord@phongtro.vn' });
    
    if (!landlord) {
      console.log('Creating default landlord user...');
      landlord = await User.create({
        full_name: 'Chủ nhà mặc định',
        email: 'landlord@phongtro.vn',
        password: 'defaultpassword123',
        phone_number: '0123456789',
        role: 'landlord',
        is_verified: true
      });
      console.log('✅ Created default landlord user');
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Starting restoration process...\n');
    
    for (let i = 0; i < posts.length; i++) {
      const postData = posts[i];
      
      try {
        // Decode all string fields from HTML entities
        const decodedPost = decodeObject(postData);
        
        console.log(`[${i + 1}/${posts.length}] Processing: ${decodedPost.title.substring(0, 50)}...`);
        
        // Create Room first
        const roomData = {
          title: decodedPost.title,
          description: decodedPost.description,
          price: decodedPost.price,
          area: decodedPost.area,
          location: {
            city: decodedPost.location.city,
            district: decodedPost.location.district || '',
            ward: decodedPost.location.ward || '',
            address: decodedPost.location.address,
            coordinates: [0, 0] // Default coordinates as [lng, lat] array
          },
          amenities: decodedPost.amenities || [],
          images: decodedPost.images || [],
          landlord: landlord._id
        };
        
        const room = await Room.create(roomData);
        
        // Create Post with active status
        const postCreateData = {
          roomId: room._id,
          landlord: landlord._id,
          propertyType: decodedPost.type || 'phong_tro',
          status: 'active', // Set all restored posts as active
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: decodedPost.createdAt || new Date(),
          updatedAt: decodedPost.updatedAt || new Date()
        };
        
        await Post.create(postCreateData);
        
        successCount++;
        console.log(`✅ Success: Created room and post`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing post ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESTORATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully restored: ${successCount} posts`);
    console.log(`❌ Failed: ${errorCount} posts`);
    console.log(`📝 Total processed: ${posts.length} posts`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Fatal error during restoration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the script
(async () => {
  await connectDB();
  await restoreFromMeiliSearch();
})();
