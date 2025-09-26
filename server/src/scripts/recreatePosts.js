import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const recreatePosts = async () => {
  try {
    console.log('🔄 Recreating posts...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Get all rooms
    const rooms = await Room.find({ landlord: landlord._id });
    console.log(`Found ${rooms.length} rooms`);

    // 3. Delete all existing posts
    const deletedPosts = await Post.deleteMany({ landlord: landlord._id });
    console.log(`Deleted ${deletedPosts.deletedCount} existing posts`);

    // 4. Create new posts from rooms
    let createdCount = 0;
    for (const room of rooms) {
      const postData = {
        title: room.title,
        description: room.description,
        price: room.price,
        area: room.area,
        address: room.address,
        city: room.city,
        images: room.images,
        amenities: room.amenities,
        roomId: room._id,
        landlord: landlord._id,
        status: 'active',
        favouriteLevel: ['free', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)],
        views: Math.floor(Math.random() * 1000) + 50,
        likes: Math.floor(Math.random() * 100) + 10
      };

      const post = new Post(postData);
      await post.save();
      createdCount++;
      console.log(`✅ Created post: ${room.title}`);
    }

    console.log(`\n📊 Created ${createdCount} new posts`);

    // 5. Verify the fix
    console.log('\n🔍 Verifying fix...');
    const newPosts = await Post.find({ landlord: landlord._id });
    const brokenPosts = newPosts.filter(post => 
      !post.title || post.title === 'undefined' || !post.price || post.price === 0
    );
    
    console.log(`Total posts: ${newPosts.length}`);
    console.log(`Broken posts: ${brokenPosts.length}`);
    
    if (brokenPosts.length === 0) {
      console.log('✅ All posts are now properly created!');
      
      // Show sample posts
      console.log('\n📝 Sample posts:');
      newPosts.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. ${post.title} - ${post.price.toLocaleString()} VND`);
      });
    } else {
      console.log('❌ Some posts are still broken');
      brokenPosts.forEach(post => {
        console.log(`  - ${post._id}: title="${post.title}", price=${post.price}`);
      });
    }

    console.log('\n🎉 Posts recreation completed!');

  } catch (error) {
    console.error('❌ Error recreating posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the recreation
connectDB().then(() => recreatePosts());

