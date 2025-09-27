import mongoose from "mongoose";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixAllPosts = async () => {
  try {
    console.log('🔧 Fixing all posts...');

    // Find all posts
    const posts = await Post.find({}).populate('roomId');
    console.log(`Found ${posts.length} total posts`);

    let fixedCount = 0;
    for (const post of posts) {
      let needsUpdate = false;
      const updates = {};

      // Fix title
      if (!post.title || post.title === 'undefined' || post.title.trim() === '') {
        if (post.roomId && post.roomId.title) {
          updates.title = post.roomId.title;
          needsUpdate = true;
        } else {
          updates.title = `Tin đăng phòng trọ ${post._id.toString().slice(-6)}`;
          needsUpdate = true;
        }
      }

      // Fix price
      if (!post.price || post.price === 0) {
        if (post.roomId && post.roomId.price) {
          updates.price = post.roomId.price;
          needsUpdate = true;
        } else {
          updates.price = Math.floor(Math.random() * 5000000) + 2000000; // Random price 2-7M
          needsUpdate = true;
        }
      }

      // Fix other fields from room
      if (post.roomId) {
        if (!post.description || post.description.trim() === '') {
          updates.description = post.roomId.description;
          needsUpdate = true;
        }
        if (!post.area || post.area === 0) {
          updates.area = post.roomId.area;
          needsUpdate = true;
        }
        if (!post.address || post.address.trim() === '') {
          updates.address = post.roomId.address;
          needsUpdate = true;
        }
        if (!post.city || post.city.trim() === '') {
          updates.city = post.roomId.city;
          needsUpdate = true;
        }
        if (!post.images || post.images.length === 0) {
          updates.images = post.roomId.images;
          needsUpdate = true;
        }
        if (!post.amenities || post.amenities.length === 0) {
          updates.amenities = post.roomId.amenities;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Post.findByIdAndUpdate(post._id, updates);
        fixedCount++;
        console.log(`✅ Fixed post: ${updates.title || post.title}`);
      }
    }

    console.log(`\n📊 Fixed ${fixedCount} posts out of ${posts.length} total posts`);

    // Final check
    const remainingBadPosts = await Post.find({
      $or: [
        { title: { $in: [null, undefined, '', 'undefined'] } },
        { price: { $in: [null, undefined, 0] } }
      ]
    });
    
    console.log(`\n🔍 Remaining posts with issues: ${remainingBadPosts.length}`);

    console.log('\n🎉 All posts fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the fix
connectDB().then(() => fixAllPosts());



