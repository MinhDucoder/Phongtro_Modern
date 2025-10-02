# 🧪 Hướng Dẫn Test Notification Realtime

## 📋 Checklist

- [ ] Backend server đang chạy (port 5000)
- [ ] Frontend đang chạy (port 3000)
- [ ] MongoDB đang chạy
- [ ] Đã có user trong database

## 🔧 Test 1: Backend Notifications (Database)

### Chạy test script:

```bash
cd Phongtro_Modern/server
node test-notification.js
```

### Kết quả mong đợi:
- ✅ Tạo được 4 notifications
- ✅ Query được notifications
- ✅ Count được unread
- ✅ Mark as read thành công

---

## 🌐 Test 2: API Endpoints

### Cách 1: Sử dụng REST Client (VS Code Extension)

1. Install extension "REST Client" trong VS Code
2. Mở file `test-notification-api.http`
3. Lấy token:
   - Đăng nhập vào frontend
   - Mở DevTools (F12) → Application → Local Storage
   - Copy value của `auth_tokens` → `accessToken`
4. Thay `YOUR_ACCESS_TOKEN_HERE` trong file
5. Click "Send Request" để test từng endpoint

### Cách 2: Sử dụng cURL

```bash
# Get notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/notifications

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/notifications/unread-count

# Mark as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/notifications/NOTIFICATION_ID/read

# Mark all as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/notifications/mark-all-read
```

### Cách 3: Sử dụng Postman

1. Import collection từ `test-notification-api.http`
2. Set Bearer Token
3. Test từng endpoint

---

## ⚡ Test 3: Realtime Notifications (Socket.io)

### Chuẩn bị:

1. Lấy access token như hướng dẫn ở Test 2
2. Mở file `server/test-realtime-notification.js`
3. Thay `YOUR_ACCESS_TOKEN_HERE` bằng token thật

### Chạy test:

```bash
cd Phongtro_Modern/server
node test-realtime-notification.js
```

### Kết quả mong đợi:
- ✅ Connect thành công
- ✅ Hiển thị Socket ID
- ✅ Có thể gọi getNotifications
- ✅ Có thể markAsRead

### Test nhận notification realtime:

**Terminal 1** (Listener):
```bash
node test-realtime-notification.js
```

**Terminal 2** (Trigger):
```bash
# Chạy script tạo notification
node test-notification.js
```

→ Terminal 1 sẽ nhận notification realtime! 🎉

---

## 🎨 Test 4: Frontend UI

### Bước 1: Đăng nhập

1. Start frontend: `cd phongtro-modern && npm run dev`
2. Mở http://localhost:3000
3. Đăng nhập với user bất kỳ

### Bước 2: Xem Notifications

1. Vào trang `/thong-bao`
2. Kiểm tra:
   - ✅ Hiển thị danh sách notifications
   - ✅ Unread count đúng
   - ✅ Filter hoạt động (All, Unread, Important)
   - ✅ Click notification → mark as read
   - ✅ Click "Đánh dấu tất cả đã đọc"

### Bước 3: Test Realtime Updates

**Mở 2 tabs browser:**

**Tab 1:** Đăng nhập user A → Mở `/thong-bao`

**Tab 2:** Đăng nhập admin → Vào `/admin/moderation`
- Duyệt/từ chối bài đăng của user A

**Kết quả mong đợi:**
- Tab 1 sẽ nhận notification realtime ngay lập tức! ⚡
- Browser notification xuất hiện (nếu đã cho phép)
- Unread count tăng

---

## 🔍 Test 5: End-to-End Flow

### Scenario: Landlord đăng bài → Admin duyệt → Landlord nhận thông báo

1. **Login as Landlord:**
   ```
   Email: landlord@example.com
   Mở trang: /dang-tin
   ```

2. **Đăng bài mới:**
   - Điền form đăng tin
   - Submit
   - Bài đăng vào trạng thái "pending"

3. **Login as Admin (tab khác):**
   ```
   Email: admin@example.com
   Mở trang: /admin/moderation
   ```

4. **Duyệt bài:**
   - Tìm bài vừa đăng
   - Click "Duyệt"
   - Check "Gửi thông báo"

5. **Kiểm tra Landlord tab:**
   - 🔔 Notification realtime xuất hiện
   - ✅ Hiển thị "Bài đăng đã được duyệt"
   - 🔗 Click vào → redirect đến bài đăng

---

## 🐛 Troubleshooting

### Không nhận được realtime notification

**Kiểm tra:**

1. Socket connection:
   ```javascript
   // Trong browser console
   console.log(window.socket?.connected); // Should be true
   ```

2. User đã đăng nhập:
   ```javascript
   // Trong browser console
   localStorage.getItem('auth_tokens'); // Should exist
   ```

3. Backend logs:
   ```
   ✅ Socket connected: xxxxx
   📢 User 123 registered for notifications with socket xxxxx
   ```

### API trả về 401 Unauthorized

- Token hết hạn → Đăng nhập lại
- Token sai format → Check Bearer Token
- Chưa đăng nhập → Login trước

### Notification không lưu vào DB

- Check MongoDB connection
- Check model import
- Xem logs error trong console

---

## 📊 Test Results Template

```
✅ Test 1: Backend Database
  ✓ Create notifications
  ✓ Query notifications
  ✓ Mark as read
  ✓ Filter by priority

✅ Test 2: API Endpoints
  ✓ GET /notifications
  ✓ GET /notifications/unread-count
  ✓ PUT /notifications/:id/read
  ✓ PUT /notifications/mark-all-read
  ✓ DELETE /notifications/:id

✅ Test 3: Socket.io Realtime
  ✓ Connect successfully
  ✓ Receive notifications
  ✓ Mark as read via socket
  ✓ Get history via socket

✅ Test 4: Frontend UI
  ✓ Display notifications
  ✓ Unread count badge
  ✓ Filter functionality
  ✓ Mark as read on click
  ✓ Delete notifications

✅ Test 5: End-to-End
  ✓ Post approval → notification
  ✓ Post rejection → notification
  ✓ Realtime delivery
  ✓ Browser notification
```

---

## 🎯 Quick Test Commands

```bash
# 1. Test backend
cd Phongtro_Modern/server
node test-notification.js

# 2. Test realtime (Terminal 1)
node test-realtime-notification.js

# 3. Trigger notification (Terminal 2)
node test-notification.js

# 4. Check MongoDB
mongosh
use phongtro
db.notifications.find().pretty()
```

---

## 📝 Notes

- Notifications tự động emit qua socket khi được tạo
- Hỗ trợ multiple devices (1 user nhiều tabs/devices)
- Browser notification cần user cho phép
- Notification được lưu vĩnh viễn trong DB
- Socket reconnect tự động khi mất kết nối



