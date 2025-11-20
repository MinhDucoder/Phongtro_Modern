const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Room = require('../src/models/Room');
const Post = require('../src/models/Post');
const User = require('../src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main restore function
const restoreFromMeiliSearch = async () => {
  try {
    console.log('📖 Reading posts from MeiliSearch backup...');
    
    const jsonPath = path.join(__dirname, '../meili-backup/posts_from_meili_fixed.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const posts = JSON.parse(rawData);
    
    console.log(`Found ${posts.length} posts in backup file`);
    
    // Create or get default landlord user
    let landlord = await User.findOne({ email: 'landlord@phongtro.vn' });
    
    if (!landlord) {
      console.log('Creating default landlord user...');
      landlord = await User.create({
        fullName: 'Chủ nhà mặc định',
        email: 'landlord@phongtro.vn',
        password: 'defaultpassword123',
        phoneNumber: '0123456789',
        role: 'landlord',
        isVerified: true
      });
      console.log('✅ Created default landlord user');
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('\n🔄 Starting restoration process...\n');
    
    for (let i = 0; i < posts.length; i++) {
      const postData = posts[i];
      
      try {
        console.log(`[${i + 1}/${posts.length}] Processing: ${postData.title.substring(0, 50)}...`);
        
        // Create Room first
        const roomData = {
          title: postData.title,
          description: postData.description,
          price: postData.price,
          area: postData.area,
          location: {
            city: postData.location.city,
            district: postData.location.district || '',
            ward: postData.location.ward || '',
            address: postData.location.address,
            coordinates: postData.location.coordinates || { lat: 0, lng: 0 }
          },
          amenities: postData.amenities || [],
          images: postData.images || [],
          landlord: landlord._id
        };
        
        const room = await Room.create(roomData);
        
        // Create Post
        const postCreateData = {
          room: room._id,
          landlord: landlord._id,
          type: postData.type || 'phong_tro',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        };
        
        await Post.create(postCreateData);
        
        successCount++;
        console.log(`✅ Success`);
        
      } catch (error) {
        errorCount++;
        errors.push({ post: i + 1, title: postData.title, error: error.message });
        console.error(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESTORATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully restored: ${successCount} posts`);
    console.log(`❌ Failed: ${errorCount} posts`);
    console.log(`📝 Total processed: ${posts.length} posts`);
    console.log('='.repeat(60));
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. Post ${err.post}: ${err.title.substring(0, 40)}...`);
        console.log(`   Error: ${err.error}\n`);
      });
    }
    
    // Verify restoration
    const totalRooms = await Room.countDocuments();
    const totalPosts = await Post.countDocuments();
    console.log('\n📈 Current database status:');
    console.log(`   Rooms in database: ${totalRooms}`);
    console.log(`   Posts in database: ${totalPosts}`);
    
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
