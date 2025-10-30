/**
 * 🚀 Script tạo indexes cho MongoDB để tối ưu hóa hiệu suất queries
 * Run: node src/scripts/createIndexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/postSchema.js';
import Room from '../models/roomSchema.js';
import User from '../models/userSchema.js';

dotenv.config();

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ========== POST INDEXES ==========
    console.log('\n📊 Creating Post indexes...');
    
    // Index cho status (most queried field)
    await Post.collection.createIndex({ status: 1 });
    console.log('✅ Created index: Post.status');
    
    // Index cho landlord (lookup)
    await Post.collection.createIndex({ landlord: 1 });
    console.log('✅ Created index: Post.landlord');
    
    // Index cho roomId (lookup)
    await Post.collection.createIndex({ roomId: 1 });
    console.log('✅ Created index: Post.roomId');
    
    // Compound index cho status + createdAt (list posts sorted by date)
    await Post.collection.createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Created index: Post.status + createdAt');
    
    // Compound index cho status + favouriteLevel (VIP posts)
    await Post.collection.createIndex({ status: 1, favouriteLevel: 1 });
    console.log('✅ Created index: Post.status + favouriteLevel');
    
    // Index cho expiredAt (cleanup expired posts)
    await Post.collection.createIndex({ expiredAt: 1 });
    console.log('✅ Created index: Post.expiredAt');

    // ========== ROOM INDEXES ==========
    console.log('\n📊 Creating Room indexes...');
    
    // Index cho propertyType (filter by type)
    await Room.collection.createIndex({ propertyType: 1 });
    console.log('✅ Created index: Room.propertyType');
    
    // Index cho city (filter by province)
    await Room.collection.createIndex({ city: 1 });
    console.log('✅ Created index: Room.city');
    
    // Compound index cho city + district
    await Room.collection.createIndex({ city: 1, district: 1 });
    console.log('✅ Created index: Room.city + district');
    
    // Compound index cho propertyType + city
    await Room.collection.createIndex({ propertyType: 1, city: 1 });
    console.log('✅ Created index: Room.propertyType + city');
    
    // Index cho price (range queries)
    await Room.collection.createIndex({ price: 1 });
    console.log('✅ Created index: Room.price');
    
    // Compound index cho price + area (common filters)
    await Room.collection.createIndex({ price: 1, area: 1 });
    console.log('✅ Created index: Room.price + area');
    
    // Index cho landlord (query rooms by landlord)
    await Room.collection.createIndex({ landlord: 1 });
    console.log('✅ Created index: Room.landlord');
    
    // Index cho isAvailable (filter available rooms)
    await Room.collection.createIndex({ isAvailable: 1 });
    console.log('✅ Created index: Room.isAvailable');
    
    // Text index cho full-text search
    await Room.collection.createIndex(
      { 
        title: 'text', 
        description: 'text', 
        address: 'text' 
      },
      {
        weights: {
          title: 10,
          description: 5,
          address: 3
        },
        name: 'room_text_search'
      }
    );
    console.log('✅ Created text index: Room.title + description + address');

    // ========== USER INDEXES ==========
    console.log('\n📊 Creating User indexes...');
    
    // Index cho email (unique, login)
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created unique index: User.email');
    
    // Index cho phone (contact)
    await User.collection.createIndex({ phone: 1 });
    console.log('✅ Created index: User.phone');
    
    // Index cho role (filter by role)
    await User.collection.createIndex({ role: 1 });
    console.log('✅ Created index: User.role');
    
    // Compound index cho role + last_login (active users)
    await User.collection.createIndex({ role: 1, last_login: -1 });
    console.log('✅ Created index: User.role + last_login');

    // ========== LIST ALL INDEXES ==========
    console.log('\n📋 Listing all indexes...');
    
    const postIndexes = await Post.collection.indexes();
    console.log('\n📊 Post Indexes:');
    postIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    const roomIndexes = await Room.collection.indexes();
    console.log('\n📊 Room Indexes:');
    roomIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    const userIndexes = await User.collection.indexes();
    console.log('\n📊 User Indexes:');
    userIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ All indexes created successfully!');
    console.log('🚀 Performance optimization completed!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createIndexes();
