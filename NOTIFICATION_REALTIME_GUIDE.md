# Hướng dẫn Notification Realtime

## Tổng quan

Hệ thống notification realtime đã được tích hợp hoàn chỉnh với Socket.io, cho phép gửi thông báo realtime đến người dùng.

## Backend Setup

### 1. Model Notification

Model notification được định nghĩa trong `server/src/models/notification.js`:

```javascript
{
  userId: ObjectId,           // User nhận thông báo
  type: String,               // Loại thông báo
  title: String,              // Tiêu đề
  content: String,            // Nội dung
  link: String,               // Đường dẫn khi click
  isRead: Boolean,            // Đã đọc chưa
  priority: String,           // low, medium, high
  relatedProperty: Object,    // Thông tin phòng liên quan
  relatedUser: Object,        // User liên quan
  metadata: Map               // Dữ liệu bổ sung
}
```

### 2. Socket Handler

Notification socket handler được setup trong `server/src/sockets/notificationHandler.js`:

- Tự động đăng ký user khi connect
- Emit notification realtime khi có thông báo mới
- Hỗ trợ get history và mark as read qua socket

### 3. API Endpoints

```
GET    /api/v1/notifications                    - Lấy danh sách thông báo
GET    /api/v1/notifications/unread-count       - Lấy số lượng chưa đọc
PUT    /api/v1/notifications/:id/read           - Đánh dấu đã đọc
PUT    /api/v1/notifications/mark-all-read      - Đánh dấu tất cả đã đọc
DELETE /api/v1/notifications/:id                - Xóa thông báo
DELETE /api/v1/notifications                    - Xóa tất cả
```

### 4. Gửi Notification từ Backend

#### Sử dụng Helper Functions

```javascript
import { 
  sendPostApprovedNotification,
  sendPostRejectedNotification,
  sendPaymentSuccessNotification,
  sendMessageNotification,
  sendBookingNotification,
  sendSystemNotification 
} from "../utils/notificationHelper.js";

// Ví dụ: Gửi thông báo bài đăng được duyệt
await sendPostApprovedNotification(
  userId,
  "Phòng trọ gần ĐH Bách Khoa",
  postId
);

// Ví dụ: Gửi thông báo bài đăng bị từ chối
await sendPostRejectedNotification(
  userId,
  "Phòng trọ ABC",
  "Thiếu hình ảnh",
  postId
);

// Ví dụ: Gửi thông báo thanh toán
await sendPaymentSuccessNotification(
  userId,
  "Gói VIP 30 ngày",
  500000
);
```

#### Sử dụng Generic Function

```javascript
import { sendNotification } from "../utils/notificationHelper.js";

await sendNotification({
  userId: "user_id_here",
  type: "system",                    // view, like, call, message, post_approved, post_rejected, payment, system, booking, review
  title: "Tiêu đề thông báo",
  content: "Nội dung chi tiết",
  link: "/path/to/page",             // Optional
  priority: "high",                  // low, medium, high
  relatedProperty: {                 // Optional
    id: "property_id",
    title: "Tên phòng",
    image: "url_to_image"
  },
  relatedUser: {                     // Optional
    id: "user_id",
    name: "Tên user",
    avatar: "url_to_avatar"
  },
  metadata: {                        // Optional
    key: "value"
  }
});
```

## Frontend Setup

### 1. Hook useNotification

Hook `useNotification` cung cấp các functions:

```typescript
const {
  notifications,           // Danh sách thông báo
  unreadCount,            // Số lượng chưa đọc
  isLoading,              // Loading state
  error,                  // Error state
  fetchNotifications,     // Lấy danh sách
  fetchUnreadCount,       // Lấy số lượng chưa đọc
  markAsRead,             // Đánh dấu đã đọc
  markAllAsRead,          // Đánh dấu tất cả
  deleteNotification,     // Xóa thông báo
  deleteAllNotifications  // Xóa tất cả
} = useNotification();
```

### 2. Component NotificationCenter

Component đã được tích hợp sẵn:

```typescript
import NotificationCenter from '@/components/notifications/NotificationCenter';

// Sử dụng trong page
<NotificationCenter />
```

### 3. Realtime Updates

Socket tự động kết nối khi user đăng nhập và lắng nghe event `notification`:

```typescript
// Tự động nhận thông báo realtime
socket.on('notification', (notification) => {
  // Thêm vào danh sách
  // Tăng unread count
  // Hiển thị browser notification (nếu được phép)
});
```

## Ví dụ Thực tế

### 1. Gửi thông báo khi duyệt bài đăng

```javascript
// In ModerationController.js
if (status === 'approved') {
  await sendPostApprovedNotification(
    existingPost.landlord._id,
    postTitle,
    postId
  );
}
```

### 2. Gửi thông báo tin nhắn mới

```javascript
// In ChatHandler.js hoặc MessageController
await sendMessageNotification(
  receiverId,
  senderName,
  messageText,
  conversationId
);
```

### 3. Gửi thông báo lịch hẹn

```javascript
// In BookingController
await sendBookingNotification(
  landlordId,
  propertyTitle,
  bookingDate,
  propertyId
);
```

## Browser Notification

Frontend tự động request permission và hiển thị browser notification khi:
- User cho phép notification
- Có thông báo mới
- User không đang xem trang

## Testing

### Test từ Backend

```javascript
// Test gửi notification
const testNotification = await sendSystemNotification(
  "user_id_here",
  "Test Notification",
  "This is a test notification",
  "/test",
  "high"
);
```

### Test từ Frontend

1. Đăng nhập vào hệ thống
2. Mở trang /thong-bao
3. Trigger action từ admin (duyệt/từ chối bài đăng)
4. Xem notification xuất hiện realtime

## Socket Events

### Server → Client

- `notification` - Thông báo mới

### Client → Server

- `getNotifications` - Lấy danh sách thông báo
- `markNotificationRead` - Đánh dấu đã đọc

## Troubleshooting

### Không nhận được notification realtime

1. Kiểm tra socket connection: `socket.connected`
2. Kiểm tra user đã đăng nhập
3. Kiểm tra notification handler đã được init: `initNotificationHelper(io)`
4. Check console logs ở backend

### Notification không lưu vào database

1. Kiểm tra Notification model đã được import
2. Kiểm tra MongoDB connection
3. Check logs error khi create notification

### Frontend không hiển thị

1. Kiểm tra useNotification hook được gọi đúng
2. Kiểm tra API response
3. Check network tab để xem API calls
4. Verify socket connection trong SocketContext

## Notes

- Notification tự động tạo browser notification nếu user cho phép
- Notification được lưu vào database và sync realtime
- Hỗ trợ multiple devices (cùng 1 user có thể login nhiều nơi)
- Priority cao (high) được hiển thị nổi bật hơn



