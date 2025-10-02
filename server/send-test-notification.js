#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import Notification from './src/models/notification.js';
import User from './src/models/userSchema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro';

// Parse command line arguments
const args = process.argv.slice(2);
const userId = args[0];
const type = args[1] || 'system';
const title = args[2] || 'Test Notification';
const content = args[3] || 'This is a test notification from CLI';

async function sendTestNotification() {
  try {
    await mongoose.connect(MONGODB_URI);

    let targetUserId = userId;

    // If no userId provided, use first user
    if (!targetUserId) {
      const user = await User.findOne({});
      if (!user) {
        console.log('❌ No users found. Please create a user first.');
        process.exit(1);
      }
      targetUserId = user._id;
      console.log(`📝 Using user: ${user.full_name} (${user._id})`);
    }

    // Create notification
    const notification = await Notification.create({
      userId: targetUserId,
      type,
      title,
      content,
      link: '/thong-bao',
      priority: 'medium',
    });

    console.log('\n✅ Notification created successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`ID: ${notification._id}`);
    console.log(`Type: ${notification.type}`);
    console.log(`Title: ${notification.title}`);
    console.log(`Content: ${notification.content}`);
    console.log(`Created: ${notification.createdAt}`);
    console.log('═══════════════════════════════════════');
    
    console.log('\n💡 Tip: If user is online, they will receive this notification via Socket.io');
    console.log('💡 Otherwise, they will see it when they login and check /thong-bao page\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Show usage if needed
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
📢 Send Test Notification

Usage:
  node send-test-notification.js [userId] [type] [title] [content]

Arguments:
  userId    User ID to send notification to (optional, uses first user if not provided)
  type      Notification type (optional, default: system)
            Options: system, message, post_approved, post_rejected, payment, booking, view, like, call
  title     Notification title (optional)
  content   Notification content (optional)

Examples:
  # Send default notification to first user
  node send-test-notification.js

  # Send to specific user
  node send-test-notification.js 68cfdc4b2605ddca5ed3e741

  # Send with custom type
  node send-test-notification.js 68cfdc4b2605ddca5ed3e741 message

  # Send with full details
  node send-test-notification.js 68cfdc4b2605ddca5ed3e741 post_approved "Bài đăng đã duyệt" "Bài đăng của bạn đã được admin duyệt"
  `);
  process.exit(0);
}

sendTestNotification();



