import mongoose from "mongoose";
import Payment from "../models/paymentSchema.js";
import Favorite from "../models/favoriteSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import { connectDB } from "../config/mongodbConfig.js";

const testLandlordAPIs = async () => {
  try {
    console.log('🧪 Testing landlord APIs...');

    // 1. Find landlord user
    const landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      console.log('❌ Landlord user not found');
      return;
    }

    // 2. Test Payment History API
    console.log('\n📊 Testing Payment History API...');
    const payments = await Payment.find({ user: landlord._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${payments.length} payments`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.packageName} - ${payment.status} - ${payment.amount} VND`);
    });

    // 3. Test Saved Properties API
    console.log('\n💾 Testing Saved Properties API...');
    const savedProperties = await Favorite.find({ user: landlord._id })
      .populate({
        path: 'post',
        populate: {
          path: 'roomId',
          select: 'title description price area address city images amenities status'
        }
      })
      .populate({
        path: 'room',
        select: 'title description price area address city images amenities'
      })
      .lean();

    console.log(`Found ${savedProperties.length} saved properties`);
    savedProperties.forEach((fav, index) => {
      console.log(`${index + 1}. ${fav.room?.title || 'N/A'} - Saved: ${fav.savedAt}`);
    });

    // 4. Test API response format
    console.log('\n🔍 Testing API response format...');
    
    // Payment History format
    const paymentHistoryResponse = {
      success: true,
      data: {
        payments: payments.map(payment => ({
          id: payment._id,
          packageName: payment.packageName,
          packageType: payment.packageType,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          packageStartDate: payment.packageStartDate,
          packageEndDate: payment.packageEndDate,
          packageDuration: payment.packageDuration,
          invoiceUrl: payment.invoice?.invoiceUrl,
          notes: payment.notes,
          createdAt: payment.created_at,
          completedAt: payment.completedAt,
          failedAt: payment.failedAt,
          failureReason: payment.failureReason,
        })),
        pagination: {
          total: payments.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      }
    };

    console.log('Payment History API Response:');
    console.log(`- Success: ${paymentHistoryResponse.success}`);
    console.log(`- Payments count: ${paymentHistoryResponse.data.payments.length}`);
    console.log(`- First payment: ${paymentHistoryResponse.data.payments[0]?.packageName || 'N/A'}`);

    // Saved Properties format
    const savedPropertiesResponse = {
      success: true,
      data: {
        properties: savedProperties.map(fav => ({
          id: fav._id,
          postId: fav.post?._id,
          title: fav.post?.roomId?.title || fav.room?.title || 'N/A',
          description: fav.post?.roomId?.description || fav.room?.description || '',
          price: fav.post?.roomId?.price || fav.room?.price || 0,
          area: fav.post?.roomId?.area || fav.room?.area || 0,
          location: `${fav.post?.roomId?.address || fav.room?.address || ''}, ${fav.post?.roomId?.city || fav.room?.city || ''}`.trim(),
          address: fav.post?.roomId?.address || fav.room?.address || '',
          city: fav.post?.roomId?.city || fav.room?.city || '',
          images: fav.post?.roomId?.images || fav.room?.images || [],
          amenities: fav.post?.roomId?.amenities || fav.room?.amenities || [],
          status: fav.post?.status || 'unknown',
          isFeatured: fav.post?.favouriteLevel === 'vip' || fav.post?.favouriteLevel === 'platinum',
          savedDate: fav.savedAt,
          notes: fav.notes,
          tags: fav.tags || [],
          contact: {
            name: fav.post?.landlord?.full_name || 'N/A',
            phone: fav.post?.landlord?.phone || '',
            email: fav.post?.landlord?.email || ''
          }
        })),
        pagination: {
          total: savedProperties.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      }
    };

    console.log('\nSaved Properties API Response:');
    console.log(`- Success: ${savedPropertiesResponse.success}`);
    console.log(`- Properties count: ${savedPropertiesResponse.data.properties.length}`);
    console.log(`- First property: ${savedPropertiesResponse.data.properties[0]?.title || 'N/A'}`);

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
connectDB().then(() => testLandlordAPIs());
