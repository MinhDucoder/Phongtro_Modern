import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Import models
import Notification from './src/models/notification.js';
import User from './src/models/userSchema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro';

async function testNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a test user
    const user = await User.findOne({});
    
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    console.log(`📝 Testing with user: ${user.full_name} (${user._id})`);

    // Test 1: Create various notification types
    console.log('\n📢 Test 1: Creating notifications...');

    const testNotifications = [
      {
        userId: user._id,
        type: 'post_approved',
        title: 'Bài đăng đã được duyệt',
        content: 'Bài đăng "Phòng trọ test" đã được duyệt và hiển thị công khai',
        link: '/dashboard/tin-dang',
        priority: 'medium',
      },
      {
        userId: user._id,
        type: 'message',
        title: 'Tin nhắn mới từ Admin',
        content: 'Chào bạn! Đây là tin nhắn test',
        link: '/chat/123',
        priority: 'high',
      },
      {
        userId: user._id,
        type: 'system',
        title: 'Thông báo hệ thống',
        content: 'Hệ thống notification realtime đang hoạt động!',
        link: '/thong-bao',
        priority: 'low',
      },
      {
        userId: user._id,
        type: 'payment',
        title: 'Thanh toán thành công',
        content: 'Bạn đã thanh toán 500.000đ cho gói VIP 30 ngày',
        link: '/dashboard/thanh-toan',
        priority: 'medium',
      },
    ];

    for (const notif of testNotifications) {
      const created = await Notification.create(notif);
      console.log(`  ✅ Created ${notif.type}: ${notif.title}`);
    }

    // Test 2: Query notifications
    console.log('\n📋 Test 2: Querying notifications...');
    
    const allNotifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`  Found ${allNotifications.length} notifications for user`);
    allNotifications.forEach((n, i) => {
      console.log(`  ${i + 1}. [${n.type}] ${n.title} - ${n.isRead ? '✓ Read' : '✗ Unread'}`);
    });

    // Test 3: Unread count
    console.log('\n📊 Test 3: Unread count...');
    
    const unreadCount = await Notification.countDocuments({ 
      userId: user._id, 
      isRead: false 
    });
    
    console.log(`  Unread notifications: ${unreadCount}`);

    // Test 4: Mark as read
    console.log('\n✅ Test 4: Mark as read...');
    
    const firstUnread = await Notification.findOne({ 
      userId: user._id, 
      isRead: false 
    });
    
    if (firstUnread) {
      await Notification.findByIdAndUpdate(firstUnread._id, { isRead: true });
      console.log(`  Marked notification "${firstUnread.title}" as read`);
    } else {
      console.log('  No unread notifications found');
    }

    // Test 5: Priority filtering
    console.log('\n⚠️ Test 5: High priority notifications...');
    
    const highPriority = await Notification.find({ 
      userId: user._id, 
      priority: 'high' 
    });
    
    console.log(`  Found ${highPriority.length} high priority notifications`);
    highPriority.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.title}`);
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n💡 Tips:');
    console.log('  - Đăng nhập vào frontend và mở trang /thong-bao');
    console.log('  - Các notification vừa tạo sẽ hiển thị');
    console.log('  - Để test realtime, trigger action từ admin (duyệt/từ chối bài)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📌 Disconnected from MongoDB');
  }
}

// Run test
testNotifications();



