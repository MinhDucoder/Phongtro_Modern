# 🚀 Hướng dẫn Test Chat Socket Real-time

## 📋 Tổng quan

Frontend đã được kết nối hoàn toàn với backend socket chat. Dưới đây là hướng dẫn để test và sử dụng.

## 🔧 Cài đặt và Chạy

### 1. Cài đặt Dependencies
```bash
# Backend (đã có socket.io)
cd server
npm install

# Frontend (đã cài socket.io-client)
cd ../phongtro-modern
npm install
```

### 2. Chạy Development Environment
```bash
# Cách 1: Sử dụng script tự động
./start-dev.bat

# Cách 2: Chạy thủ công
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd phongtro-modern
npm run dev
```

## 🌐 URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Socket Server**: ws://localhost:5000

## 🧪 Test Chat Functionality

### 1. Truy cập Chat Page
1. Đăng nhập vào hệ thống
2. Truy cập: http://localhost:3000/chat
3. Giao diện chat sạch sẽ và professional

### 2. Debug Panel (Optional)
Để hiển thị test panel, thêm `?debug=true` vào URL:
- **URL**: http://localhost:3000/chat?debug=true
- **Features**:
  - Socket Status: Kiểm tra kết nối socket
  - Test Open Conversation: Tạo cuộc trò chuyện mới
  - Send Test Message: Gửi tin nhắn test
  - Recent Conversations: Xem danh sách cuộc trò chuyện

### 3. Socket Status Indicator
- **Green dot**: Đã kết nối socket
- **Red dot**: Mất kết nối
- **Gray dot**: Đang kết nối

### 4. Manual Testing với 2 Browser
1. **Mở 2 browser windows**:
   - Browser 1: http://localhost:3000/chat?debug=true
   - Browser 2: http://localhost:3000/chat?debug=true

2. **Lấy User ID**:
   - Copy User ID từ Browser 1
   - Copy User ID từ Browser 2

3. **Tạo cuộc trò chuyện**:
   - Trên Browser 1: Paste User ID của Browser 2 vào input
   - Click "Tạo Cuộc Trò Chuyện"
   - Hoặc trên Browser 2: Paste User ID của Browser 1

4. **Nhắn tin real-time**:
   - Gõ tin nhắn trong input "Tin nhắn test"
   - Click "Gửi Tin Nhắn Test"
   - Tin nhắn sẽ hiển thị trên cả 2 browser ngay lập tức

5. **Test giao diện chat**:
   - Sau khi có conversation, click vào conversation trong sidebar
   - Sử dụng giao diện chat chính để nhắn tin

## 🔌 Socket Events

### Client → Server
- `joinConversation`: Tham gia room chat
- `openConversation`: Mở/tạo cuộc trò chuyện
- `sendMessage`: Gửi tin nhắn
- `messageSeen`: Đánh dấu đã đọc

### Server → Client
- `receiveMessage`: Nhận tin nhắn mới
- `messageSeen`: Cập nhật trạng thái đã đọc
- `conversationUpdated`: Cập nhật conversation

## 📁 Cấu trúc Files đã tạo/cập nhật

### Frontend
```
src/
├── contexts/
│   ├── SocketContext.tsx     # Quản lý kết nối socket
│   └── ChatContext.tsx       # Quản lý state chat
├── lib/
│   └── chatApi.ts            # API functions cho chat
├── components/chat/
│   ├── ChatLayout.tsx        # Layout chính (đã cập nhật)
│   ├── ChatWindow.tsx        # Cửa sổ chat (đã cập nhật)
│   ├── ConversationList.tsx  # Danh sách cuộc trò chuyện (đã cập nhật)
│   └── ChatTestButton.tsx    # Component test (mới)
└── app/
    ├── layout.tsx            # Đã thêm providers
    └── chat/page.tsx         # Đã thêm test panel
```

### Backend (đã có sẵn)
```
server/src/
├── sockets/
│   └── chatHandler.js        # Xử lý socket events
├── models/
│   ├── conversation.js       # Model conversation
│   └── message.js           # Model message
├── controllers/
│   ├── ConversationController.js
│   └── MessageController.js
└── routes/v1/
    ├── conversationRoutes.js
    └── messageRoutes.js
```

## 🐛 Troubleshooting

### 1. Socket không kết nối
- Kiểm tra backend có chạy trên port 5000
- Kiểm tra authentication token
- Xem console log để debug

### 2. Messages không real-time
- Kiểm tra socket connection status
- Xem network tab để kiểm tra WebSocket connection
- Kiểm tra backend logs

### 3. Authentication errors
- Đảm bảo user đã đăng nhập
- Kiểm tra token trong localStorage
- Xem backend middleware authentication

## 🎯 Tính năng đã hoàn thành

✅ **Socket Connection**: Kết nối real-time với backend  
✅ **Authentication**: Tích hợp JWT token với socket  
✅ **Conversation Management**: Tạo và quản lý cuộc trò chuyện  
✅ **Real-time Messaging**: Gửi/nhận tin nhắn real-time  
✅ **Message Status**: Đánh dấu đã đọc, delivered, seen  
✅ **Error Handling**: Xử lý lỗi và reconnection  
✅ **UI/UX**: Giao diện chat responsive và đẹp  

## 🚀 Sẵn sàng Production

Chat system đã hoàn chỉnh và sẵn sàng cho production:
- Remove test panel trong `/chat/page.tsx`
- Update socket URL từ localhost sang production domain
- Configure CORS cho production domain
- Add proper error logging và monitoring

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs (F12)
2. Network tab (WebSocket connections)
3. Backend terminal logs
4. Database connection
