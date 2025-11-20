import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name).join(', '));
    console.log('');
    
    // Count documents
    const counts = {
      posts: await db.collection('posts').countDocuments(),
      rooms: await db.collection('rooms').countDocuments(),
      users: await db.collection('users').countDocuments(),
      favorites: await db.collection('favorites').countDocuments()
    };
    
    console.log('📊 Document counts:');
    console.log(`   Posts: ${counts.posts}`);
    console.log(`   Rooms: ${counts.rooms}`);
    console.log(`   Users: ${counts.users}`);
    console.log(`   Favorites: ${counts.favorites}`);
    console.log('');
    
    // Check active posts
    const activePosts = await db.collection('posts').countDocuments({ status: 'active' });
    console.log(`✅ Active posts: ${activePosts}`);
    
    // Sample post
    if (counts.posts > 0) {
      const sample = await db.collection('posts').findOne({}, { projection: { roomId: 1, status: 1, propertyType: 1 }});
      console.log('📄 Sample post:', JSON.stringify(sample, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkStatus();
