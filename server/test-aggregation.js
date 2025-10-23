/**
 * Script test lọc propertyType với aggregation pipeline
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

// Import models
import Post from './src/models/postSchema.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro';

async function testFilterWithAggregation() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Test filter phong_tro with aggregation
    console.log('\n=== TEST FILTER PHONG_TRO WITH AGGREGATION ===');
    
    const pipeline = [
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "roomId"
        }
      },
      { $unwind: "$roomId" },
      {
        $match: { "roomId.propertyType": "phong_tro" }
      },
      {
        $lookup: {
          from: "users",
          localField: "landlord",
          foreignField: "_id",
          as: "landlord"
        }
      },
      { $unwind: { path: "$landlord", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          items: [{ $skip: 0 }, { $limit: 5 }]
        }
      }
    ];

    const result = await Post.aggregate(pipeline);
    
    console.log('Total phong_tro posts:', result[0]?.totalCount[0]?.count || 0);
    console.log('Sample posts:');
    result[0]?.items.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.roomId?.title}`);
      console.log(`   Type: ${post.roomId?.propertyType}`);
      console.log(`   Price: ${post.roomId?.price}`);
      console.log(`   City: ${post.roomId?.city}`);
    });

    // Test filter nha_nguyen_can
    console.log('\n\n=== TEST FILTER NHA_NGUYEN_CAN ===');
    const pipeline2 = [
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "roomId"
        }
      },
      { $unwind: "$roomId" },
      {
        $match: { "roomId.propertyType": "nha_nguyen_can" }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ];

    const result2 = await Post.aggregate(pipeline2);
    console.log('Total nha_nguyen_can posts:', result2[0]?.count || 0);

    // Test filter can_ho_mini
    console.log('\n\n=== TEST FILTER CAN_HO_MINI ===');
    const pipeline3 = [
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "roomId"
        }
      },
      { $unwind: "$roomId" },
      {
        $match: { "roomId.propertyType": "can_ho_mini" }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ];

    const result3 = await Post.aggregate(pipeline3);
    console.log('Total can_ho_mini posts:', result3[0]?.count || 0);

    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFilterWithAggregation();
