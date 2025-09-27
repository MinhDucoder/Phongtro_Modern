import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Room from "../models/roomSchema.js";
import Post from "../models/postSchema.js";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import RentalRequest from "../models/rentalRequestSchema.js";
import PostAnalytics from "../models/postAnalyticsSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const fixDataConsistency = async () => {
  try {
    console.log('🔧 Fixing data consistency issues...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Fix Posts
    console.log('\n📝 Fixing posts...');
    const posts = await Post.find({ landlord: landlord._id }).populate('roomId');
    let fixedPosts = 0;
    
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
        fixedPosts++;
        console.log(`✅ Fixed post: ${updates.title || post.title}`);
      }
    }

    console.log(`📝 Fixed ${fixedPosts} posts`);

    // 3. Fix Rooms (ensure all have proper data)
    console.log('\n🏠 Checking rooms...');
    const rooms = await Room.find({ landlord: landlord._id });
    let fixedRooms = 0;
    
    for (const room of rooms) {
      let needsUpdate = false;
      const updates = {};

      if (!room.title || room.title.trim() === '') {
        updates.title = `Phòng trọ ${room._id.toString().slice(-6)}`;
        needsUpdate = true;
      }
      if (!room.price || room.price === 0) {
        updates.price = Math.floor(Math.random() * 5000000) + 2000000;
        needsUpdate = true;
      }
      if (!room.area || room.area === 0) {
        updates.area = Math.floor(Math.random() * 30) + 20; // 20-50 m2
        needsUpdate = true;
      }
      if (!room.address || room.address.trim() === '') {
        updates.address = 'Địa chỉ chưa cập nhật';
        needsUpdate = true;
      }
      if (!room.city || room.city.trim() === '') {
        updates.city = 'TP.HCM';
        needsUpdate = true;
      }
      if (!room.description || room.description.trim() === '') {
        updates.description = 'Phòng trọ với đầy đủ tiện nghi, phù hợp cho sinh viên và người đi làm.';
        needsUpdate = true;
      }
      if (!room.images || room.images.length === 0) {
        updates.images = ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'];
        needsUpdate = true;
      }
      if (!room.amenities || room.amenities.length === 0) {
        updates.amenities = ['wifi', 'aircon'];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Room.findByIdAndUpdate(room._id, updates);
        fixedRooms++;
        console.log(`✅ Fixed room: ${updates.title || room.title}`);
      }
    }

    console.log(`🏠 Fixed ${fixedRooms} rooms`);

    // 4. Fix Payments (ensure all have proper data)
    console.log('\n💳 Checking payments...');
    const payments = await Payment.find({ user: landlord._id });
    let fixedPayments = 0;
    
    for (const payment of payments) {
      let needsUpdate = false;
      const updates = {};

      if (!payment.packageName || payment.packageName.trim() === '') {
        const packageNames = ['Gói Cơ Bản', 'Gói Bạc', 'Gói Vàng', 'Gói Platinum', 'Gói VIP'];
        updates.packageName = packageNames[Math.floor(Math.random() * packageNames.length)];
        needsUpdate = true;
      }
      if (!payment.amount || payment.amount === 0) {
        updates.amount = Math.floor(Math.random() * 500000) + 50000; // 50k-550k
        needsUpdate = true;
      }
      if (!payment.status || payment.status.trim() === '') {
        const statuses = ['pending', 'completed', 'failed'];
        updates.status = statuses[Math.floor(Math.random() * statuses.length)];
        needsUpdate = true;
      }
      if (!payment.paymentMethod || payment.paymentMethod.trim() === '') {
        const methods = ['vnpay', 'momo', 'zalopay', 'bank_transfer'];
        updates.paymentMethod = methods[Math.floor(Math.random() * methods.length)];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Payment.findByIdAndUpdate(payment._id, updates);
        fixedPayments++;
        console.log(`✅ Fixed payment: ${updates.packageName || payment.packageName}`);
      }
    }

    console.log(`💳 Fixed ${fixedPayments} payments`);

    // 5. Fix Saved Properties (ensure all have proper relationships)
    console.log('\n💾 Checking saved properties...');
    const favorites = await Favorite.find({ user: landlord._id });
    let fixedFavorites = 0;
    
    for (const fav of favorites) {
      let needsUpdate = false;
      const updates = {};

      if (!fav.savedAt) {
        updates.savedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        needsUpdate = true;
      }
      if (!fav.notes || fav.notes.trim() === '') {
        updates.notes = 'Tin đăng quan tâm';
        needsUpdate = true;
      }
      if (!fav.tags || fav.tags.length === 0) {
        updates.tags = ['quan_tam', 'theo_doi'];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Favorite.findByIdAndUpdate(fav._id, updates);
        fixedFavorites++;
        console.log(`✅ Fixed saved property: ${fav._id}`);
      }
    }

    console.log(`💾 Fixed ${fixedFavorites} saved properties`);

    // 6. Fix Rental Requests (ensure all have proper data)
    console.log('\n📝 Checking rental requests...');
    const rentalRequests = await RentalRequest.find({ landlord: landlord._id });
    let fixedRentalRequests = 0;
    
    for (const req of rentalRequests) {
      let needsUpdate = false;
      const updates = {};

      if (!req.message || req.message.trim() === '') {
        updates.message = 'Tôi quan tâm đến phòng trọ này, có thể xem phòng được không?';
        needsUpdate = true;
      }
      if (!req.expectedMoveIn) {
        updates.expectedMoveIn = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        needsUpdate = true;
      }
      if (!req.contactPhone || req.contactPhone.trim() === '') {
        updates.contactPhone = '0123456789';
        needsUpdate = true;
      }
      if (!req.contactEmail || req.contactEmail.trim() === '') {
        updates.contactEmail = 'tenant@example.com';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await RentalRequest.findByIdAndUpdate(req._id, updates);
        fixedRentalRequests++;
        console.log(`✅ Fixed rental request: ${req._id}`);
      }
    }

    console.log(`📝 Fixed ${fixedRentalRequests} rental requests`);

    // 7. Fix Analytics (ensure all have proper data)
    console.log('\n📊 Checking analytics...');
    const analytics = await PostAnalytics.find({ landlord: landlord._id });
    let fixedAnalytics = 0;
    
    for (const analyticsRecord of analytics) {
      let needsUpdate = false;
      const updates = {};

      if (!analyticsRecord.date || analyticsRecord.date.trim() === '') {
        updates.date = new Date().toISOString().split('T')[0];
        needsUpdate = true;
      }
      if (!analyticsRecord.metrics) {
        updates.metrics = {
          views: Math.floor(Math.random() * 1000) + 100,
          uniqueViews: Math.floor(Math.random() * 800) + 80,
          likes: Math.floor(Math.random() * 50) + 10,
          shares: Math.floor(Math.random() * 20) + 5,
          calls: Math.floor(Math.random() * 10) + 2,
          messages: Math.floor(Math.random() * 15) + 3,
          rentalRequests: Math.floor(Math.random() * 8) + 2,
          avgViewDuration: Math.floor(Math.random() * 300) + 60
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await PostAnalytics.findByIdAndUpdate(analyticsRecord._id, updates);
        fixedAnalytics++;
        console.log(`✅ Fixed analytics: ${analyticsRecord._id}`);
      }
    }

    console.log(`📊 Fixed ${fixedAnalytics} analytics records`);

    // 8. Summary
    console.log('\n📊 Fix Summary:');
    console.log(`📝 Posts fixed: ${fixedPosts}`);
    console.log(`🏠 Rooms fixed: ${fixedRooms}`);
    console.log(`💳 Payments fixed: ${fixedPayments}`);
    console.log(`💾 Saved properties fixed: ${fixedFavorites}`);
    console.log(`📝 Rental requests fixed: ${fixedRentalRequests}`);
    console.log(`📊 Analytics fixed: ${fixedAnalytics}`);

    const totalFixed = fixedPosts + fixedRooms + fixedPayments + fixedFavorites + fixedRentalRequests + fixedAnalytics;
    console.log(`\n🎉 Total items fixed: ${totalFixed}`);

    console.log('\n✅ Data consistency fix completed!');

  } catch (error) {
    console.error('❌ Error fixing data consistency:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the fix
connectDB().then(() => fixDataConsistency());



