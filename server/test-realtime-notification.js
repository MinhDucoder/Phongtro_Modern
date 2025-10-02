import { io } from 'socket.io-client';
import readline from 'readline';

// Replace with your actual token
const TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
const SERVER_URL = 'http://localhost:5000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔌 Connecting to Socket.io server...');

const socket = io(SERVER_URL, {
  auth: {
    token: TOKEN
  },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to server!');
  console.log('Socket ID:', socket.id);
  console.log('\n📢 Listening for notifications...');
  console.log('Press Ctrl+C to exit\n');
  
  showMenu();
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\n💡 Tips:');
  console.log('  1. Make sure server is running on port 5000');
  console.log('  2. Update TOKEN variable with your actual access token');
  console.log('  3. Get token from browser localStorage: auth_tokens');
  process.exit(1);
});

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('\n🔔 NEW NOTIFICATION RECEIVED:');
  console.log('═══════════════════════════════════════');
  console.log(`📌 Type: ${notification.type}`);
  console.log(`📝 Title: ${notification.title}`);
  console.log(`💬 Content: ${notification.content}`);
  console.log(`⭐ Priority: ${notification.priority}`);
  console.log(`🔗 Link: ${notification.link || 'N/A'}`);
  console.log(`📅 Created: ${new Date(notification.createdAt).toLocaleString('vi-VN')}`);
  console.log('═══════════════════════════════════════\n');
  
  showMenu();
});

function showMenu() {
  console.log('\n📋 Commands:');
  console.log('  1 - Get notifications');
  console.log('  2 - Mark notification as read');
  console.log('  3 - Exit');
  rl.question('Enter command: ', handleCommand);
}

function handleCommand(cmd) {
  switch(cmd.trim()) {
    case '1':
      getNotifications();
      break;
    case '2':
      rl.question('Enter notification ID: ', (id) => {
        markAsRead(id.trim());
      });
      break;
    case '3':
      console.log('👋 Goodbye!');
      socket.disconnect();
      process.exit(0);
      break;
    default:
      console.log('Invalid command');
      showMenu();
  }
}

function getNotifications() {
  socket.emit('getNotifications', { page: 1, limit: 5 }, (response) => {
    if (response.success) {
      console.log(`\n📬 Notifications (${response.notifications.length}/${response.total}):`);
      response.notifications.forEach((n, i) => {
        const status = n.isRead ? '✓' : '✗';
        console.log(`  ${i + 1}. [${status}] ${n.title} (ID: ${n._id})`);
      });
    } else {
      console.log('Error:', response.error);
    }
    showMenu();
  });
}

function markAsRead(notificationId) {
  socket.emit('markNotificationRead', { notificationId }, (response) => {
    if (response.success) {
      console.log('✅ Notification marked as read');
    } else {
      console.log('❌ Error:', response.error);
    }
    showMenu();
  });
}

console.log('\n💡 How to get your token:');
console.log('  1. Open browser DevTools (F12)');
console.log('  2. Go to Application > Local Storage');
console.log('  3. Find "auth_tokens" key');
console.log('  4. Copy the "accessToken" value');
console.log('  5. Replace TOKEN variable in this script\n');



