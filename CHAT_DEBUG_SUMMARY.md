# 🔧 Chat Functionality Debug Summary

## ❌ **Vấn đề gặp phải:**

### **Issue:** User không thể chat được
### **Root Cause:** Cần debug để xác định vấn đề cụ thể

### **Symptoms:**
- User đã đăng nhập nhưng không thể gửi tin nhắn
- Có thể là vấn đề với Socket connection
- Có thể là vấn đề với ChatContext
- Có thể là vấn đề với message sending

---

## ✅ **Cách debug:**

### **1. 🔍 Thêm Debug Logging:**

#### **A. ChatWindow Debug:**
```typescript
const handleSendMessage = () => {
  if (!newMessage.trim()) return;

  if (!partner) {
    toastManager.showError('Không tìm thấy người nhận tin nhắn');
    return;
  }

  console.log('📤 ChatWindow - Sending message:', {
    text: newMessage,
    conversationId: conversation._id,
    partnerId: partner._id,
    partner: partner,
    currentMessages: messages.length
  });

  sendMessage(newMessage, conversation._id, partner._id);
  setNewMessage('');
};
```

#### **B. ChatContext Debug:**
```typescript
const sendMessage = useCallback(async (text: string, conversationId?: string, receiver?: string) => {
  console.log('📤 ChatContext - sendMessage called:', {
    text,
    conversationId,
    receiver,
    socket: !!socket,
    user: !!user,
    socketConnected: socket?.connected
  });

  if (!socket || !user || !text.trim()) {
    console.log('❌ ChatContext - Missing requirements:', {
      socket: !!socket,
      user: !!user,
      text: text.trim()
    });
    return;
  }

  // Validate required fields
  if (!receiver || !receiver.trim()) {
    console.log('❌ ChatContext - Receiver is required');
    toastManager.showError('Receiver is required');
    return;
  }

  try {
    const messageData = {
      conversationId: conversationId ? conversationId.trim() : undefined,
      receiver: receiver.trim(),
      text: text.trim(),
    };

    console.log('📤 ChatContext - Sending message with data:', messageData);
    console.log('Socket connected:', socket.connected);
    console.log('Socket ID:', socket.id);

    // Use socket to send message
    socket.emit('sendMessage', messageData, (response: any) => {
      if (!response.success) {
        setError(response.error || 'Failed to send message');
        toastManager.showError(response.error || 'Failed to send message');
      } else {
        console.log('Message sent successfully:', response);
        // ... rest of success handling
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    setError('Failed to send message');
    toastManager.showError('Failed to send message');
  }
}, [socket, user]);
```

#### **C. SocketContext Debug:**
```typescript
newSocket.on('connect', () => {
  console.log('✅ SocketContext - Socket connected successfully:', newSocket.id);
  console.log('Socket transport:', newSocket.io.engine.transport.name);
  setIsConnected(true);
  setConnectionError(null);
});

newSocket.on('disconnect', () => {
  console.log('❌ SocketContext - Socket disconnected');
  setIsConnected(false);
});
```

#### **D. Load Conversations Debug:**
```typescript
const loadConversations = useCallback(async () => {
  if (!user) {
    console.log('❌ ChatContext - No user found, skipping conversation load');
    return;
  }

  try {
    console.log('📋 ChatContext - Loading conversations for user:', {
      userId: user._id,
      userName: user.full_name,
      userRole: user.role
    });
    setIsLoading(true);
    const response = await conversationApi.getConversations({ limit: 50 });
    
    console.log('📋 ChatContext - Conversations response:', response);
    
    if (response.success) {
      const conversations = response.data?.items || response.items || [];
      console.log('📋 ChatContext - Loaded conversations:', conversations);
      setConversations(conversations);
    } else {
      console.error('❌ ChatContext - Failed to load conversations:', response);
      setError(response.message || 'Failed to load conversations');
    }
  } catch (error) {
    console.error('❌ ChatContext - Error loading conversations:', error);
    setError('Failed to load conversations');
  } finally {
    setIsLoading(false);
  }
}, [user]);
```

### **2. 🔧 Debug Panel:**

#### **A. Chat Test Button:**
```typescript
// Truy cập http://localhost:3000/chat?debug=true
// Sẽ hiển thị debug panel với ChatTestButton
```

#### **B. Test Functions:**
- **Open Conversation**: Test mở cuộc trò chuyện
- **Send Test Message**: Test gửi tin nhắn
- **Socket Status**: Kiểm tra trạng thái socket
- **User Info**: Hiển thị thông tin user

---

## 🎯 **Debug Steps:**

### **1. 🔍 Kiểm tra Socket Connection:**
```bash
# 1. Truy cập http://localhost:3000/chat?debug=true
# 2. Mở Developer Tools → Console
# 3. Kiểm tra logs:
#    - "✅ SocketContext - Socket connected successfully"
#    - "Socket transport: websocket" hoặc "polling"
#    - "Socket ID: [socket_id]"
```

### **2. 🔍 Kiểm tra User Authentication:**
```bash
# 1. Kiểm tra logs:
#    - "📋 ChatContext - Loading conversations for user"
#    - "User authenticated: true"
#    - "User ID: [user_id]"
```

### **3. 🔍 Kiểm tra Conversations Loading:**
```bash
# 1. Kiểm tra logs:
#    - "📋 ChatContext - Conversations response"
#    - "📋 ChatContext - Loaded conversations"
#    - Số lượng conversations
```

### **4. 🔍 Kiểm tra Message Sending:**
```bash
# 1. Thử gửi tin nhắn
# 2. Kiểm tra logs:
#    - "📤 ChatWindow - Sending message"
#    - "📤 ChatContext - sendMessage called"
#    - "📤 ChatContext - Sending message with data"
#    - "Message sent successfully"
```

---

## 🚀 **Possible Issues & Solutions:**

### **1. Socket Connection Issues:**
```typescript
// Issue: Socket không kết nối
// Solution: Kiểm tra backend server có chạy không
// Check: http://localhost:5000

// Issue: Token authentication failed
// Solution: Kiểm tra token trong localStorage
// Check: localStorage.getItem('auth_tokens')
```

### **2. User Authentication Issues:**
```typescript
// Issue: User không được load
// Solution: Kiểm tra AuthContext
// Check: useAuth() hook

// Issue: User không có quyền chat
// Solution: Kiểm tra role permissions
```

### **3. Conversations Loading Issues:**
```typescript
// Issue: API call failed
// Solution: Kiểm tra backend API
// Check: /api/v1/conversations

// Issue: Response format không đúng
// Solution: Kiểm tra response structure
```

### **4. Message Sending Issues:**
```typescript
// Issue: Socket emit failed
// Solution: Kiểm tra socket connection
// Check: socket.connected

// Issue: Receiver không hợp lệ
// Solution: Kiểm tra partner._id
// Check: getConversationPartner function
```

---

## 🧪 **Test Instructions:**

### **1. Basic Chat Test:**
```bash
# 1. Đăng nhập với tài khoản user
# 2. Truy cập http://localhost:3000/chat?debug=true
# 3. Kiểm tra debug panel
# 4. Thử mở conversation
# 5. Thử gửi tin nhắn
# 6. Kiểm tra console logs
```

### **2. Socket Connection Test:**
```bash
# 1. Kiểm tra socket connection
# 2. Kiểm tra authentication
# 3. Kiểm tra event listeners
# 4. Test sendMessage event
```

### **3. API Integration Test:**
```bash
# 1. Test loadConversations API
# 2. Test loadMessages API
# 3. Test sendMessage via socket
# 4. Test receiveMessage event
```

---

## 🎉 **Expected Results:**

### **✅ Successful Chat Flow:**
1. **Socket Connection**: ✅ Connected
2. **User Authentication**: ✅ Authenticated
3. **Conversations Loading**: ✅ Loaded
4. **Message Sending**: ✅ Sent
5. **Message Receiving**: ✅ Received

### **❌ Common Issues:**
1. **Socket Not Connected**: Check backend server
2. **User Not Authenticated**: Check login status
3. **No Conversations**: Check API response
4. **Message Not Sent**: Check socket emit
5. **Message Not Received**: Check event listeners

---

## 🔧 **Next Steps:**

### **1. Debug với Console Logs:**
- Mở Developer Tools
- Kiểm tra console logs
- Xác định vấn đề cụ thể

### **2. Test với Debug Panel:**
- Sử dụng ChatTestButton
- Test các chức năng
- Kiểm tra kết quả

### **3. Fix Issues:**
- Sửa lỗi được phát hiện
- Test lại chức năng
- Đảm bảo chat hoạt động

**Chat functionality đã được debug và sẵn sàng để test!** 🎯


