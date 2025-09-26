import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const seedLandlordData = async () => {
  try {
    console.log('🌱 Starting to seed landlord data...');

    // 1. Find or create test landlord user
    let landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      landlord = await User.create({
        full_name: 'Chủ nhà Test',
        email: 'landlord@test.com',
        password: hashedPassword,
        phone: '0987654321',
        role: 'landlord',
        is_verified: true
      });
      console.log('✅ Created test landlord user');
    } else {
      console.log('✅ Found existing landlord user');
    }

    // 2. Create sample rooms for landlord
    const rooms = await Room.create([
      {
        title: 'Phòng trọ cao cấp gần ĐH Bách Khoa, full nội thất',
        description: 'Phòng trọ đầy đủ tiện nghi, gần trường ĐH Bách Khoa, thuận tiện di chuyển',
        price: 4200000,
        area: 28,
        address: 'Số 123, Ngõ 45, Đường Trần Khát Chân',
        city: 'Hà Nội',
        district: 'Hai Bà Trưng',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
        amenities: ['wifi', 'aircon', 'fridge', 'washing_machine'],
        landlord: landlord._id
      },
      {
        title: 'Căn hộ mini 1PN, có ban công, view đẹp',
        description: 'Căn hộ mini hiện đại, có ban công thoáng mát, view đẹp',
        price: 5500000,
        area: 35,
        address: 'Số 456, Phố Nguyễn Trãi',
        city: 'Hà Nội',
        district: 'Thanh Xuân',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
        amenities: ['wifi', 'aircon', 'fridge', 'balcony'],
        landlord: landlord._id
      },
      {
        title: 'Phòng trọ giá rẻ, gần trường ĐH Kinh tế',
        description: 'Phòng trọ giá rẻ, phù hợp sinh viên, gần các trường đại học',
        price: 3000000,
        area: 22,
        address: 'Số 789, Đường Giải Phóng',
        city: 'Hà Nội',
        district: 'Đống Đa',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
        amenities: ['wifi', 'fridge'],
        landlord: landlord._id
      }
    ]);
    console.log(`✅ Created ${rooms.length} rooms`);

    // 3. Create posts for rooms
    const posts = await Post.create([
      {
        roomId: rooms[0]._id,
        landlord: landlord._id,
        status: 'active',
        views: 234,
        favouriteLevel: 'platinum',
        title: 'Phòng trọ cao cấp gần ĐH Bách Khoa, full nội thất',
        description: 'Phòng trọ đầy đủ tiện nghi, gần trường ĐH Bách Khoa, thuận tiện di chuyển'
      },
      {
        roomId: rooms[1]._id,
        landlord: landlord._id,
        status: 'active',
        views: 189,
        favouriteLevel: 'gold',
        title: 'Căn hộ mini 1PN, có ban công, view đẹp',
        description: 'Căn hộ mini hiện đại, có ban công thoáng mát, view đẹp'
      },
      {
        roomId: rooms[2]._id,
        landlord: landlord._id,
        status: 'active',
        views: 456,
        favouriteLevel: 'free',
        title: 'Phòng trọ giá rẻ, gần trường ĐH Kinh tế',
        description: 'Phòng trọ giá rẻ, phù hợp sinh viên, gần các trường đại học'
      }
    ]);
    console.log(`✅ Created ${posts.length} posts`);

    // 4. Create payment history
    const payments = await Payment.create([
      {
        user: landlord._id,
        packageName: 'Gói Premium - 30 ngày',
        packageType: 'premium',
        amount: 150000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'vnpay',
        transactionId: 'VNPAY_20240120_123456',
        packageStartDate: new Date('2024-01-20'),
        packageEndDate: new Date('2024-02-19'),
        packageDuration: 30,
        invoice: {
          invoiceNumber: 'INV-2024-001',
          invoiceUrl: '/invoices/invoice_1.pdf'
        },
        completedAt: new Date('2024-01-20T14:30:00'),
        notes: 'Thanh toán thành công'
      },
      {
        user: landlord._id,
        packageName: 'Gói Cơ Bản - 7 ngày',
        packageType: 'free',
        amount: 50000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'momo',
        transactionId: 'MOMO_20240115_789012',
        packageStartDate: new Date('2024-01-15'),
        packageEndDate: new Date('2024-01-22'),
        packageDuration: 7,
        completedAt: new Date('2024-01-15T10:15:00'),
        notes: 'Thanh toán qua ví MoMo'
      },
      {
        user: landlord._id,
        packageName: 'Gói VIP - 60 ngày',
        packageType: 'vip',
        amount: 300000,
        currency: 'VND',
        status: 'pending',
        paymentMethod: 'zalopay',
        transactionId: 'ZALOPAY_20240118_345678',
        packageStartDate: new Date('2024-01-18'),
        packageEndDate: new Date('2024-03-18'),
        packageDuration: 60,
        notes: 'Đang chờ xử lý thanh toán'
      },
      {
        user: landlord._id,
        packageName: 'Gói Premium - 30 ngày',
        packageType: 'premium',
        amount: 150000,
        currency: 'VND',
        status: 'failed',
        paymentMethod: 'bank_transfer',
        transactionId: 'BANK_20240110_901234',
        packageStartDate: new Date('2024-01-10'),
        packageEndDate: new Date('2024-02-09'),
        packageDuration: 30,
        failedAt: new Date('2024-01-10T09:20:00'),
        failureReason: 'Số dư không đủ',
        notes: 'Thanh toán thất bại'
      }
    ]);
    console.log(`✅ Created ${payments.length} payment records`);

    // 5. Create saved properties (favorites) for other users
    // First, create a tenant user to save properties
    let tenant = await User.findOne({ email: 'tenant@test.com' });
    if (!tenant) {
      const hashedPassword = await bcrypt.hash('123456', 10);
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

    const favorites = await Favorite.create([
      {
        user: tenant._id,
        post: posts[0]._id,
        room: rooms[0]._id,
        savedAt: new Date('2024-01-18'),
        notes: 'Phòng này rất đẹp, gần trường học',
        tags: ['gần-trường', 'đẹp', 'tiện-nghi']
      },
      {
        user: tenant._id,
        post: posts[1]._id,
        room: rooms[1]._id,
        savedAt: new Date('2024-01-17'),
        notes: 'Căn hộ có ban công, view đẹp',
        tags: ['ban-công', 'view-đẹp']
      },
      {
        user: tenant._id,
        post: posts[2]._id,
        room: rooms[2]._id,
        savedAt: new Date('2024-01-15'),
        notes: 'Giá rẻ, phù hợp sinh viên',
        tags: ['giá-rẻ', 'sinh-viên']
      }
    ]);
    console.log(`✅ Created ${favorites.length} saved properties`);

    console.log('🎉 Landlord data seeding completed!');
    console.log('📊 Summary:');
    console.log(`   - Landlord: ${landlord.full_name} (${landlord.email})`);
    console.log(`   - Rooms created: ${rooms.length}`);
    console.log(`   - Posts created: ${posts.length}`);
    console.log(`   - Payment records: ${payments.length}`);
    console.log(`   - Saved properties: ${favorites.length}`);
    console.log(`   - Tenant: ${tenant.full_name} (${tenant.email})`);

  } catch (error) {
    console.error('❌ Error seeding landlord data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedLandlordData());
