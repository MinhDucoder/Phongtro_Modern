import mongoose from "mongoose";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixPostTitles = async () => {
  try {
    console.log('🔧 Fixing post titles...');

    // Find all posts with undefined or empty titles
    const postsWithUndefinedTitles = await Post.find({
      $or: [
        { title: undefined },
        { title: null },
        { title: "" },
        { title: "undefined" }
      ]
    }).populate('roomId');

    console.log(`Found ${postsWithUndefinedTitles.length} posts with undefined titles`);

    for (const post of postsWithUndefinedTitles) {
      if (post.roomId && post.roomId.title) {
        post.title = post.roomId.title;
        await post.save();
        console.log(`✅ Fixed post title: ${post.title}`);
      } else {
        // If no room title, use a default title
        post.title = `Tin đăng phòng trọ ${post._id.toString().slice(-6)}`;
        await post.save();
        console.log(`✅ Fixed post title with default: ${post.title}`);
      }
    }

    console.log('\n📊 Summary:');
    const totalPosts = await Post.countDocuments({});
    const postsWithValidTitles = await Post.countDocuments({
      title: { $exists: true, $ne: null, $ne: "", $ne: "undefined" }
    });
    
    console.log(`Total posts: ${totalPosts}`);
    console.log(`Posts with valid titles: ${postsWithValidTitles}`);
    console.log(`Posts with invalid titles: ${totalPosts - postsWithValidTitles}`);

    console.log('\n🎉 Post titles fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing post titles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the fix
connectDB().then(() => fixPostTitles());

