import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixPostsDirectly = async () => {
  try {
    console.log('🔧 Fixing posts directly...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Get all posts
    const posts = await Post.find({ landlord: landlord._id }).populate('roomId');
    console.log(`Found ${posts.length} posts to fix`);

    let fixedCount = 0;
    for (const post of posts) {
      if (post.roomId) {
        // Update post with room data
        const updates = {
          title: post.roomId.title,
          price: post.roomId.price,
          area: post.roomId.area,
          address: post.roomId.address,
          city: post.roomId.city,
          description: post.roomId.description,
          images: post.roomId.images,
          amenities: post.roomId.amenities
        };

        await Post.findByIdAndUpdate(post._id, updates);
        fixedCount++;
        console.log(`✅ Fixed post: ${post.roomId.title}`);
      } else {
        console.log(`⚠️ Post ${post._id} has no room associated`);
      }
    }

    console.log(`\n📊 Fixed ${fixedCount} posts out of ${posts.length}`);

    // 3. Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedPosts = await Post.find({ landlord: landlord._id });
    const stillBroken = updatedPosts.filter(post => 
      !post.title || post.title === 'undefined' || !post.price || post.price === 0
    );
    
    console.log(`Posts still broken: ${stillBroken.length}`);
    if (stillBroken.length > 0) {
      console.log('Still broken posts:');
      stillBroken.forEach(post => {
        console.log(`  - ${post._id}: title="${post.title}", price=${post.price}`);
      });
    } else {
      console.log('✅ All posts are now fixed!');
    }

    console.log('\n🎉 Posts fix completed!');

  } catch (error) {
    console.error('❌ Error fixing posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the fix
connectDB().then(() => fixPostsDirectly());

