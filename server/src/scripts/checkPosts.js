import mongoose from 'mongoose';
import Post from '../models/postSchema.js';
import Room from '../models/roomSchema.js';
import User from '../models/userSchema.js';

const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";

async function checkPosts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Check total posts
        const totalPosts = await Post.countDocuments();
        console.log('Total posts:', totalPosts);

        // Check posts by status
        const postsByStatus = await Post.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('Posts by status:', postsByStatus);

        // Check active posts
        const activePosts = await Post.find({ status: 'active' })
            .populate('roomId')
            .populate('landlord')
            .limit(5);
        
        console.log('Sample active posts:', activePosts.length);
        if (activePosts.length > 0) {
            console.log('First active post:', JSON.stringify(activePosts[0], null, 2));
        }

        // Check total rooms
        const totalRooms = await Room.countDocuments();
        console.log('Total rooms:', totalRooms);

        // Check total users
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers);

    } catch (error) {
        console.error('Error checking posts:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkPosts();