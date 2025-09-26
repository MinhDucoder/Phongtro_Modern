import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Room from "../models/roomSchema.js";
import Post from "../models/postSchema.js";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const seedMoreLandlordData = async () => {
  try {
    console.log('🌱 Seeding more data for landlord@test.com...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Create more rooms for the landlord
    const additionalRooms = [
      {
        title: "Phòng trọ cao cấp view biển, full nội thất",
        description: "Phòng trọ view biển tuyệt đẹp với đầy đủ tiện nghi hiện đại. Có ban công rộng ngắm cảnh biển, điều hòa, tủ lạnh, máy giặt riêng.",
        price: 8500000,
        area: 35,
        address: "123 Đường Võ Văn Tần, Phường 6, Quận 3",
        city: "TP.HCM",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
        ],
        amenities: ["aircon", "wifi", "fridge", "washing_machine", "balcony"],
        landlord: landlord._id,
        status: "available"
      },
      {
        title: "Căn hộ studio sang trọng, gần trung tâm",
        description: "Studio hiện đại với thiết kế tối ưu, phù hợp cho người đi làm. Gần các trung tâm thương mại, bệnh viện, trường học.",
        price: 12000000,
        area: 45,
        address: "456 Nguyễn Huệ, Phường Bến Nghé, Quận 1",
        city: "TP.HCM",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
        ],
        amenities: ["aircon", "wifi", "fridge", "washing_machine"],
        landlord: landlord._id,
        status: "available"
      },
      {
        title: "Phòng trọ giá rẻ cho sinh viên, gần ĐH Sư phạm",
        description: "Phòng trọ giá cả phải chăng, phù hợp cho sinh viên. Có khu bếp chung, wifi miễn phí, gần trường đại học.",
        price: 3500000,
        area: 20,
        address: "789 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy",
        city: "Hà Nội",
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0ef9b8c1b?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
        ],
        amenities: ["wifi"],
        landlord: landlord._id,
        status: "available"
      },
      {
        title: "Căn hộ 2PN, có gara xe, gần metro",
        description: "Căn hộ 2 phòng ngủ với gara xe riêng, gần ga metro. Phù hợp cho gia đình nhỏ hoặc nhóm bạn.",
        price: 15000000,
        area: 65,
        address: "321 Đường Thủ Đức, Phường Linh Trung, Quận Thủ Đức",
        city: "TP.HCM",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
        ],
        amenities: ["aircon", "wifi", "fridge", "washing_machine"],
        landlord: landlord._id,
        status: "available"
      }
    ];

    console.log('🏠 Creating additional rooms...');
    const createdRooms = [];
    for (const roomData of additionalRooms) {
      const room = new Room(roomData);
      await room.save();
      createdRooms.push(room);
      console.log(`✅ Created room: ${room.title}`);
    }

    // 3. Create posts for these rooms
    console.log('📝 Creating posts for new rooms...');
    const createdPosts = [];
    for (const room of createdRooms) {
      const post = new Post({
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
        status: "active",
        favouriteLevel: ["free", "silver", "gold", "platinum"][Math.floor(Math.random() * 4)],
        views: Math.floor(Math.random() * 1000) + 50,
        likes: Math.floor(Math.random() * 100) + 10
      });
      await post.save();
      createdPosts.push(post);
      console.log(`✅ Created post: ${post.title}`);
    }

    // 4. Create more payment records
    console.log('💳 Creating additional payment records...');
    const additionalPayments = [
      {
        user: landlord._id,
        packageName: "Gói Vàng - 45 ngày",
        packageType: "gold",
        packageDuration: 45,
        amount: 250000,
        currency: "VND",
        status: "completed",
        paymentMethod: "momo",
        transactionId: `MOMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invoiceUrl: `https://invoice.example.com/${Date.now()}_gold.pdf`,
        notes: "Nâng cấp gói để tăng hiển thị tin đăng",
        packageStartDate: new Date('2024-01-15'),
        packageEndDate: new Date('2024-02-28'),
        completedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15')
      },
      {
        user: landlord._id,
        packageName: "Gói Bạc - 21 ngày",
        packageType: "silver",
        packageDuration: 21,
        amount: 120000,
        currency: "VND",
        status: "completed",
        paymentMethod: "zalopay",
        transactionId: `ZALO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invoiceUrl: `https://invoice.example.com/${Date.now()}_silver.pdf`,
        notes: "Gói bạc để test hiệu quả",
        packageStartDate: new Date('2024-02-01'),
        packageEndDate: new Date('2024-02-21'),
        completedAt: new Date('2024-02-01'),
        createdAt: new Date('2024-02-01')
      },
      {
        user: landlord._id,
        packageName: "Gói Platinum - 90 ngày",
        packageType: "platinum",
        packageDuration: 90,
        amount: 500000,
        currency: "VND",
        status: "pending",
        paymentMethod: "bank_transfer",
        transactionId: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notes: "Gói cao cấp nhất, đang chờ xử lý",
        packageStartDate: new Date('2024-03-01'),
        packageEndDate: new Date('2024-05-29'),
        createdAt: new Date('2024-03-01')
      }
    ];

    for (const paymentData of additionalPayments) {
      const payment = new Payment(paymentData);
      await payment.save();
      console.log(`✅ Created payment: ${payment.packageName} - ${payment.status}`);
    }

    // 5. Create more saved properties from other landlords
    console.log('💾 Creating additional saved properties...');
    
    // Find some posts from other landlords to save
    const otherPosts = await Post.find({ 
      landlord: { $ne: landlord._id } 
    }).limit(3);
    
    if (otherPosts.length > 0) {
      for (const post of otherPosts) {
        // Check if already saved
        const existingFavorite = await Favorite.findOne({
          user: landlord._id,
          post: post._id
        });
        
        if (!existingFavorite) {
          const favorite = new Favorite({
            user: landlord._id,
            post: post._id,
            room: post.roomId,
            savedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            notes: `Quan tâm đến ${post.title}`,
            tags: ["quan_tam", "theo_doi", "có_thể_thuê"]
          });
          await favorite.save();
          console.log(`✅ Saved property: ${post.title}`);
        } else {
          console.log(`⚠️ Property already saved: ${post.title}`);
        }
      }
    }

    // 6. Summary
    console.log('\n📊 Data Summary:');
    const totalRooms = await Room.countDocuments({ landlord: landlord._id });
    const totalPosts = await Post.countDocuments({ landlord: landlord._id });
    const totalPayments = await Payment.countDocuments({ user: landlord._id });
    const totalSaved = await Favorite.countDocuments({ user: landlord._id });
    
    console.log(`🏠 Total rooms: ${totalRooms}`);
    console.log(`📝 Total posts: ${totalPosts}`);
    console.log(`💳 Total payments: ${totalPayments}`);
    console.log(`💾 Total saved properties: ${totalSaved}`);

    console.log('\n🎉 Successfully seeded more data for landlord@test.com!');

  } catch (error) {
    console.error('❌ Error seeding more landlord data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedMoreLandlordData());
