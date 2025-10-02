# Sửa Lỗi Chat Trên Trang Profile

## 📋 Vấn Đề

Tính năng chat trên trang profile bị lỗi khi truy cập với URL có tham số `conversationId`:
- URL: `http://localhost:3000/profile?tab=chat&conversationId=68dce0900e2f7a2844f684bc`
- Conversation không được load đúng cách
- Có thể gặp race condition giữa việc load conversations và set active conversation

## 🔍 Nguyên Nhân

### 1. Race Condition
- `ProfileChatLayout` lấy `conversationId` từ URL ngay lập tức
- Nhưng `conversations` từ `ChatContext` có thể chưa được load xong
- `ChatContext` chỉ load conversations khi:
  - User đã đăng nhập
  - Socket đã kết nối (`isConnected = true`)

### 2. Thiếu Error Handling
- Không có UI hiển thị khi conversation không tìm thấy
- Không có thông báo lỗi rõ ràng cho người dùng
- Không kiểm tra trạng thái loading

## ✅ Giải Pháp Đã Thực Hiện

### 1. Sửa Race Condition
**File:** `phongtro-modern/src/components/chat/ProfileChatLayout.tsx`

```typescript
const conversationIdFromUrl = searchParams.get('conversationId');
const [conversationNotFound, setConversationNotFound] = useState(false);

useEffect(() => {
  if (conversationIdFromUrl && conversations.length > 0) {
    const conv = conversations.find(c => c._id === conversationIdFromUrl);
    if (conv) {
      setActiveConversation(conv);
      setConversationNotFound(false);
    } else if (!isLoading) {
      // Only mark as not found if conversations are fully loaded
      setConversationNotFound(true);
      console.error('Conversation not found:', conversationIdFromUrl);
    }
  }
}, [conversationIdFromUrl, conversations, setActiveConversation, isLoading]);
```

**Cải tiến:**
- Thêm dependency `isLoading` vào useEffect
- Chỉ đánh dấu "not found" khi conversations đã load xong (`!isLoading`)
- Thêm state `conversationNotFound` để theo dõi trạng thái

### 2. Thêm Error UI
```typescript
{conversationNotFound && conversationIdFromUrl ? (
  <>
    <h3 className="text-xl font-semibold text-red-600 mb-2">
      Không tìm thấy cuộc trò chuyện
    </h3>
    <p className="text-gray-600 mb-6">
      Cuộc trò chuyện với ID "{conversationIdFromUrl}" không tồn tại 
      hoặc bạn không có quyền truy cập.
    </p>
    <button 
      onClick={() => router.push('/profile?tab=chat')} 
      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      Quay lại danh sách
    </button>
  </>
) : (
  // ... normal empty state
)}
```

**Cải tiến:**
- Hiển thị thông báo lỗi rõ ràng khi không tìm thấy conversation
- Cung cấp nút "Quay lại danh sách" để người dùng dễ dàng quay lại
- Giữ nguyên UI bình thường khi không có lỗi

## 🏗️ Cấu Trúc Hệ Thống Chat

### Frontend Components
```
ProfileChatLayout (phongtro-modern/src/components/chat/)
├── Lấy conversationId từ URL
├── Tìm conversation trong ChatContext
└── Hiển thị chat window hoặc error message

ChatContext (phongtro-modern/src/contexts/)
├── Load conversations từ API
├── Socket connection
├── Send/receive messages
└── Update conversation state

SocketContext (phongtro-modern/src/contexts/)
├── Kết nối Socket.IO
├── Authentication với token
└── Real-time events
```

### Backend API
```
GET /api/v1/conversations
├── Authenticate middleware
├── Lấy conversations của user
├── Populate participants data
└── Return: { success, items, total }

Socket Events
├── joinConversation
├── sendMessage
├── receiveMessage
├── messageSeen
└── openConversation
```

### Database Models
```
Conversation
├── participants: [ObjectId]
├── lastMessage: { text, sender, createdAt }
├── type: 'private' | 'group'
├── unread: Map<userId, count>
└── timestamps

Message
├── conversationId: ObjectId
├── sender: ObjectId
├── receiver: ObjectId
├── text: String
├── attachments: [{ url, public_id }]
├── status: 'sent' | 'delivered' | 'seen'
└── timestamps
```

## 🧪 Testing Checklist

- [x] Fix race condition với conversationId từ URL
- [x] Thêm error handling UI
- [ ] Test với conversation tồn tại
- [ ] Test với conversation không tồn tại
- [ ] Test khi chưa đăng nhập
- [ ] Test khi socket chưa kết nối
- [ ] Test navigation giữa các conversations

## 📝 Lưu Ý

1. **Socket Connection**: Đảm bảo socket đã kết nối trước khi load conversations
2. **Authentication**: User phải đăng nhập mới có thể truy cập chat
3. **Error Handling**: Luôn kiểm tra trạng thái loading và error
4. **Race Condition**: Sử dụng dependencies đầy đủ trong useEffect

## 🚀 Các Bước Kiểm Tra

1. Mở browser console để xem logs
2. Truy cập: `http://localhost:3000/profile?tab=chat&conversationId=<valid-id>`
3. Kiểm tra:
   - Conversation có được load không
   - Messages có hiển thị không
   - Có thể gửi tin nhắn không
4. Thử với conversationId không hợp lệ
5. Kiểm tra error message hiển thị

## 🔄 Luồng Hoạt Động

1. User truy cập `/profile?tab=chat&conversationId=xxx`
2. `ProfileChatLayout` lấy `conversationId` từ URL
3. `ChatContext` load conversations từ API (khi socket connected)
4. `ProfileChatLayout` tìm conversation matching với ID
5. Nếu tìm thấy: Set active conversation và load messages
6. Nếu không tìm thấy: Hiển thị error UI với nút quay lại

