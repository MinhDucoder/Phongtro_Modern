// src/scripts/seedDashboardData.js
import mongoose from 'mongoose';
import User from '../models/userSchema.js';
import Room from '../models/roomSchema.js';
import Post from '../models/postSchema.js';
import RentalRequest from '../models/rentalRequestSchema.js';
import PostAnalytics from '../models/postAnalyticsSchema.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDashboardData = async () => {
  try {
    console.log('🌱 Starting to seed dashboard data...');

    // 1. Create test landlord user
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    let landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      landlord = await User.create({
        full_name: 'Chủ nhà Test',
        email: 'landlord@test.com',
        password: hashedPassword,
        phone: '0987654321',
        role: 'landlord',
        is_verified: true
      });
      console.log('✅ Created test landlord user');
    }

    // 2. Create test tenant user
    let tenant = await User.findOne({ email: 'tenant@test.com' });
    if (!tenant) {
      tenant = await User.create({
        full_name: 'Người thuê Test',
        email: 'tenant@test.com',
        password: hashedPassword,
        phone: '0912345678',
        role: 'user',
        is_verified: true
      });
      console.log('✅ Created test tenant user');
    }

    // 3. Create test rooms
    const rooms = [];
    const roomsData = [
      {
        title: 'Phòng trọ gần ĐH Bách Khoa, full nội thất',
        description: 'Phòng trọ đầy đủ tiện nghi, gần trường đại học, an ninh tốt',
        price: 3500000,
        area: 25,
        address: 'Số 123, Ngõ 45, Đường Trần Khát Chân',
        city: 'Hà Nội',
        images: ['/placeholder-room.svg'],
        amenities: ['wifi', 'aircon', 'private_wc', 'washing_machine'],
        landlord: landlord._id,
        isAvailable: true
      },
      {
        title: 'Căn hộ mini 1PN, có ban công',
        description: 'Căn hộ mini hiện đại, view đẹp, đầy đủ nội thất',
        price: 4200000,
        area: 35,
        address: 'Số 456, Phố Nguyễn Trãi',
        city: 'Hà Nội',
        images: ['/placeholder-room.svg'],
        amenities: ['wifi', 'aircon', 'balcony', 'fridge'],
        landlord: landlord._id,
        isAvailable: true
      },
      {
        title: 'Phòng trọ giá rẻ gần ĐH Kinh tế',
        description: 'Phòng trọ giá rẻ, sạch sẽ, an ninh tốt',
        price: 2800000,
        area: 20,
        address: 'Số 789, Đường Giải Phóng',
        city: 'Hà Nội',
        images: ['/placeholder-room.svg'],
        amenities: ['wifi', 'private_wc'],
        landlord: landlord._id,
        isAvailable: true
      }
    ];

    for (const roomData of roomsData) {
      let room = await Room.findOne({ title: roomData.title, landlord: landlord._id });
      if (!room) {
        room = await Room.create(roomData);
        rooms.push(room);
      } else {
        rooms.push(room);
      }
    }
    console.log(`✅ Created/found ${rooms.length} test rooms`);

    // 4. Create test posts
    const posts = [];
    const postsData = [
      {
        roomId: rooms[0]._id,
        landlord: landlord._id,
        options: ['aircon', 'washing_machine', 'balcony'],
        favouriteLevel: 'gold',
        status: 'active'
      },
      {
        roomId: rooms[1]._id,
        landlord: landlord._id,
        options: ['aircon', 'balcony'],
        favouriteLevel: 'silver',
        status: 'active'
      },
      {
        roomId: rooms[2]._id,
        landlord: landlord._id,
        options: ['window'],
        favouriteLevel: 'free',
        status: 'expired'
      }
    ];

    for (const postData of postsData) {
      let post = await Post.findOne({ roomId: postData.roomId });
      if (!post) {
        post = await Post.create(postData);
        posts.push(post);
      } else {
        posts.push(post);
      }
    }
    console.log(`✅ Created/found ${posts.length} test posts`);

    // 5. Create test rental requests
    const requestsData = [
      {
        tenant: tenant._id,
        post: posts[0]._id,
        landlord: landlord._id,
        message: 'Tôi muốn thuê phòng này để ở gần trường đại học. Có thể xem phòng vào cuối tuần không?',
        expectedMoveIn: new Date('2024-02-01'),
        status: 'pending',
        contactInfo: {
          phone: tenant.phone,
          email: tenant.email,
          preferredContactMethod: 'both'
        },
        tenantInfo: {
          age: 22,
          occupation: 'Sinh viên',
          monthlyIncome: 8000000,
          rentalHistory: 'Lần đầu thuê phòng',
          numberOfPeople: 1,
          hasPets: false
        }
      },
      {
        tenant: tenant._id,
        post: posts[1]._id,
        landlord: landlord._id,
        message: 'Tôi đang tìm phòng gần công ty. Phòng này có phù hợp không?',
        expectedMoveIn: new Date('2024-01-20'),
        status: 'accepted',
        responseMessage: 'Yêu cầu của bạn đã được chấp nhận. Chúng tôi sẽ liên hệ sớm.',
        respondedAt: new Date(),
        contactInfo: {
          phone: tenant.phone,
          email: tenant.email,
          preferredContactMethod: 'phone'
        },
        tenantInfo: {
          age: 25,
          occupation: 'Nhân viên văn phòng',
          monthlyIncome: 12000000,
          rentalHistory: 'Đã thuê phòng 2 năm',
          numberOfPeople: 1,
          hasPets: false
        }
      }
    ];

    for (const requestData of requestsData) {
      const existingRequest = await RentalRequest.findOne({
        tenant: requestData.tenant,
        post: requestData.post
      });
      
      if (!existingRequest) {
        await RentalRequest.create(requestData);
      }
    }
    console.log('✅ Created test rental requests');

    // 6. Create test analytics data
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const analyticsData = [
      {
        post: posts[0]._id,
        landlord: landlord._id,
        date: today,
        metrics: {
          views: 234,
          uniqueViews: 189,
          likes: 12,
          calls: 8,
          messages: 5,
          rentalRequests: 1,
          shares: 3,
          avgViewDuration: 45
        },
        hourlyViews: [
          { hour: 9, views: 23 },
          { hour: 12, views: 45 },
          { hour: 18, views: 67 },
          { hour: 21, views: 34 }
        ],
        deviceStats: {
          mobile: 156,
          desktop: 67,
          tablet: 11
        },
        locationStats: [
          { city: 'Hà Nội', views: 180 },
          { city: 'TP.HCM', views: 34 },
          { city: 'Đà Nẵng', views: 20 }
        ],
        ageStats: {
          '18-25': 105,
          '26-35': 78,
          '36-45': 34,
          '45+': 17
        },
        revenue: 50000,
        ctr: 5.4,
        conversionRate: 0.4
      },
      {
        post: posts[1]._id,
        landlord: landlord._id,
        date: today,
        metrics: {
          views: 156,
          uniqueViews: 134,
          likes: 8,
          calls: 5,
          messages: 3,
          rentalRequests: 1,
          shares: 2,
          avgViewDuration: 38
        },
        deviceStats: {
          mobile: 98,
          desktop: 45,
          tablet: 13
        },
        revenue: 30000,
        ctr: 3.8,
        conversionRate: 0.6
      }
    ];

    for (const analyticsItem of analyticsData) {
      const existing = await PostAnalytics.findOne({
        post: analyticsItem.post,
        date: analyticsItem.date
      });
      
      if (!existing) {
        await PostAnalytics.create(analyticsItem);
      }
    }
    console.log('✅ Created test analytics data');

    console.log('🎉 Dashboard seed data completed!');
    console.log('📧 Test landlord: landlord@test.com / 123456');
    console.log('📧 Test tenant: tenant@test.com / 123456');

  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
connectDB().then(() => {
  seedDashboardData();
});
