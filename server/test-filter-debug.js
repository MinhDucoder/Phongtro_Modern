/**
 * Script test lọc propertyType
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

// Import models
import Room from './src/models/roomSchema.js';
import Post from './src/models/postSchema.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro';

async function testFilterData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Check Rooms data
    console.log('\n=== CHECKING ROOMS DATA ===');
    const allRooms = await Room.find().select('_id title propertyType city price').limit(10);
    console.log(`Total rooms: ${await Room.countDocuments()}`);
    console.log('Sample rooms:');
    console.log(JSON.stringify(allRooms, null, 2));

    // 2. Check propertyType distribution
    console.log('\n=== PROPERTY TYPES DISTRIBUTION ===');
    const typeCounts = await Room.aggregate([
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log(JSON.stringify(typeCounts, null, 2));

    // 3. Check Posts data
    console.log('\n=== CHECKING POSTS DATA ===');
    const allPosts = await Post.find().select('_id status roomId').populate('roomId', 'title propertyType').limit(10);
    console.log(`Total posts: ${await Post.countDocuments()}`);
    console.log(`Active posts: ${await Post.countDocuments({ status: 'active' })}`);
    console.log('Sample posts:');
    console.log(JSON.stringify(allPosts, null, 2));

    // 4. Test filter phong_tro
    console.log('\n=== TEST FILTER PHONG_TRO ===');
    const filteredRooms = await Room.find({ propertyType: 'phong_tro' }).select('_id title propertyType').limit(5);
    console.log(`Rooms with propertyType=phong_tro: ${filteredRooms.length}`);
    console.log(JSON.stringify(filteredRooms, null, 2));

    // 5. Test populate with match
    console.log('\n=== TEST POPULATE WITH MATCH ===');
    const postsWithFilter = await Post.find({ status: 'active' })
      .populate({
        path: 'roomId',
        select: 'title propertyType city price',
        match: { propertyType: 'phong_tro' }
      })
      .limit(10);
    
    const validPosts = postsWithFilter.filter(p => p.roomId !== null);
    console.log(`Posts with active status and roomId.propertyType=phong_tro: ${validPosts.length}`);
    console.log(JSON.stringify(validPosts, null, 2));

    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFilterData();
