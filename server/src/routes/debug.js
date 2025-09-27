import express from "express";
import Post from "../models/postSchema.js";

const debugRoute = express.Router();

debugRoute.get("/posts", async (req, res) => {
    try {
        console.log("Debug: Fetching active posts...");
        
        const posts = await Post.find({ status: 'active' })
            .populate('roomId')
            .populate('landlord')
            .limit(5)
            .sort({ createdAt: -1 });

        console.log(`Debug: Found ${posts.length} active posts`);
        
        return res.json({
            success: true,
            debug: true,
            query: req.query,
            totalActivePosts: await Post.countDocuments({ status: 'active' }),
            totalAllPosts: await Post.countDocuments(),
            samplePosts: posts.map(post => ({
                id: post._id,
                status: post.status,
                roomTitle: post.roomId?.title,
                landlordName: post.landlord?.full_name
            }))
        });
    } catch (error) {
        console.error("Debug error:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

debugRoute.get("/single-post", async (req, res) => {
    try {
        const post = await Post.findOne({ status: 'active' })
            .populate('roomId')
            .populate('landlord')
            .sort({ createdAt: -1 });
        
        return res.json({
            success: true,
            debug: "single post structure",
            post: post,
            hasRoomId: !!post?.roomId,
            roomIdType: typeof post?.roomId,
            roomTitle: post?.roomId?.title
        });
    } catch (error) {
        console.error("Debug error:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default debugRoute;