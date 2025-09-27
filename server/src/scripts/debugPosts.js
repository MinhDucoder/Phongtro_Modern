import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const debugPosts = async () => {
  try {
    console.log('🔍 Debugging posts data...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Get all posts with details
    const posts = await Post.find({ landlord: landlord._id }).populate('roomId');
    console.log(`\n📝 Found ${posts.length} posts:`);
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\n${i + 1}. Post ID: ${post._id}`);
      console.log(`   Title: "${post.title}" (type: ${typeof post.title})`);
      console.log(`   Price: ${post.price} (type: ${typeof post.price})`);
      console.log(`   Area: ${post.area} (type: ${typeof post.area})`);
      console.log(`   Address: "${post.address}"`);
      console.log(`   City: "${post.city}"`);
      console.log(`   Room ID: ${post.roomId}`);
      
      if (post.roomId) {
        console.log(`   Room Title: "${post.roomId.title}"`);
        console.log(`   Room Price: ${post.roomId.price}`);
        console.log(`   Room Area: ${post.roomId.area}`);
      } else {
        console.log(`   ❌ No room associated`);
      }
      
      // Check what's missing
      const missing = [];
      if (!post.title || post.title === 'undefined' || post.title.trim() === '') missing.push('title');
      if (!post.price || post.price === 0) missing.push('price');
      if (!post.area || post.area === 0) missing.push('area');
      if (!post.address || post.address.trim() === '') missing.push('address');
      if (!post.city || post.city.trim() === '') missing.push('city');
      
      if (missing.length > 0) {
        console.log(`   ⚠️ Missing: ${missing.join(', ')}`);
      } else {
        console.log(`   ✅ All data present`);
      }
    }

    // 3. Check rooms
    const rooms = await Room.find({ landlord: landlord._id });
    console.log(`\n🏠 Found ${rooms.length} rooms:`);
    
    for (let i = 0; i < Math.min(5, rooms.length); i++) {
      const room = rooms[i];
      console.log(`\n${i + 1}. Room ID: ${room._id}`);
      console.log(`   Title: "${room.title}"`);
      console.log(`   Price: ${room.price}`);
      console.log(`   Area: ${room.area}`);
      console.log(`   Address: "${room.address}"`);
      console.log(`   City: "${room.city}"`);
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Error debugging posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the debug
connectDB().then(() => debugPosts());



