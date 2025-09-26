import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Room from "../models/roomSchema.js";
import Post from "../models/postSchema.js";
import RentalRequest from "../models/rentalRequestSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const seedRentalRequestsAndAnalytics = async () => {
  try {
    console.log('🌱 Seeding rental requests and analytics data...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Find some tenant users
    const tenants = await User.find({ role: 'user' }).limit(5);
    if (tenants.length === 0) {
      console.log('❌ No tenant users found');
      return;
    }

    // 3. Get landlord's posts
    const landlordPosts = await Post.find({ landlord: landlord._id });
    if (landlordPosts.length === 0) {
      console.log('❌ No posts found for landlord');
      return;
    }

    console.log(`Found ${landlordPosts.length} posts for landlord`);

    // 4. Create rental requests
    console.log('📝 Creating rental requests...');
    const rentalRequests = [
      {
        post: landlordPosts[0]._id,
        room: landlordPosts[0].roomId,
        landlord: landlord._id,
        tenant: tenants[0]._id,
        status: 'pending',
        message: 'Chào anh/chị, tôi rất quan tâm đến phòng trọ này. Có thể xem phòng vào cuối tuần được không ạ?',
        contactPhone: '0123456789',
        contactEmail: tenants[0].email,
        expectedMoveIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        preferredViewingTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        post: landlordPosts[1]._id,
        room: landlordPosts[1].roomId,
        landlord: landlord._id,
        tenant: tenants[1]._id,
        status: 'accepted',
        message: 'Em muốn thuê phòng này, giá có thể thương lượng được không ạ?',
        contactPhone: '0987654321',
        contactEmail: tenants[1].email,
        expectedMoveIn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        preferredViewingTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        post: landlordPosts[2]._id,
        room: landlordPosts[2].roomId,
        landlord: landlord._id,
        tenant: tenants[2]._id,
        status: 'rejected',
        message: 'Phòng này có còn trống không ạ? Tôi muốn thuê dài hạn.',
        contactPhone: '0369852147',
        contactEmail: tenants[2].email,
        expectedMoveIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        preferredViewingTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        rejectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        rejectionReason: 'Phòng đã được thuê',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        post: landlordPosts[0]._id,
        room: landlordPosts[0].roomId,
        landlord: landlord._id,
        tenant: tenants[3]._id,
        status: 'pending',
        message: 'Chào anh/chị, tôi là sinh viên năm 3, muốn thuê phòng gần trường. Có thể xem phòng sáng mai được không?',
        contactPhone: '0912345678',
        contactEmail: tenants[3].email,
        expectedMoveIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        preferredViewingTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        post: landlordPosts[1]._id,
        room: landlordPosts[1].roomId,
        landlord: landlord._id,
        tenant: tenants[4]._id,
        status: 'accepted',
        message: 'Tôi đã xem phòng và rất hài lòng. Có thể ký hợp đồng ngay được không?',
        contactPhone: '0945678901',
        contactEmail: tenants[4].email,
        expectedMoveIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        preferredViewingTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        acceptedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];

    for (const requestData of rentalRequests) {
      const request = new RentalRequest(requestData);
      await request.save();
      console.log(`✅ Created rental request: ${request.status} - ${request.message.substring(0, 50)}...`);
    }

    // 5. Create analytics data for posts
    console.log('\n📊 Creating analytics data...');
    
    for (const post of landlordPosts.slice(0, 5)) { // Create analytics for first 5 posts
      const analyticsData = {
        post: post._id,
        landlord: landlord._id,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        metrics: {
          views: Math.floor(Math.random() * 1000) + 100,
          uniqueViews: Math.floor(Math.random() * 800) + 80,
          likes: Math.floor(Math.random() * 50) + 10,
          shares: Math.floor(Math.random() * 20) + 5,
          calls: Math.floor(Math.random() * 10) + 2,
          messages: Math.floor(Math.random() * 15) + 3,
          rentalRequests: Math.floor(Math.random() * 8) + 2,
          avgViewDuration: Math.floor(Math.random() * 300) + 60 // 1-6 minutes
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date()
      };

      const analytics = new PostAnalytics(analyticsData);
      await analytics.save();
      console.log(`✅ Created analytics for post: ${post.title}`);
    }

    // 6. Summary
    console.log('\n📊 Data Summary:');
    const totalRentalRequests = await RentalRequest.countDocuments({ landlord: landlord._id });
    const totalAnalytics = await PostAnalytics.countDocuments({ landlord: landlord._id });
    
    console.log(`📝 Total rental requests: ${totalRentalRequests}`);
    console.log(`📊 Total analytics records: ${totalAnalytics}`);
    
    // Rental requests by status
    const pendingRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'pending' });
    const approvedRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'approved' });
    const completedRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'completed' });
    const rejectedRequests = await RentalRequest.countDocuments({ landlord: landlord._id, status: 'rejected' });
    
    console.log(`   - Pending: ${pendingRequests}`);
    console.log(`   - Approved: ${approvedRequests}`);
    console.log(`   - Completed: ${completedRequests}`);
    console.log(`   - Rejected: ${rejectedRequests}`);

    console.log('\n🎉 Successfully seeded rental requests and analytics data!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedRentalRequestsAndAnalytics());
