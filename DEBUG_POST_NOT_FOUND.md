# 🐛 Debug "Post not found" Error

## ❌ **Lỗi gặp phải:**

### **Error Type:** Console Error
### **Error Message:** 
```
Post not found
```

### **Root Cause Analysis:**
Lỗi "Post not found" xảy ra khi:
1. **API Endpoint**: `/api/v1/saved-properties` yêu cầu authentication
2. **User chưa đăng nhập**: Không có token hợp lệ
3. **Post ID không tồn tại**: PostId được truyền không có trong database
4. **Authentication middleware**: Chặn request trước khi đến controller

## 🔍 **Debug Steps:**

### **1. Kiểm tra API Endpoint:**
```bash
# Test API endpoint trực tiếp
curl -X POST "http://localhost:5000/api/v1/saved-properties" \
  -H "Content-Type: application/json" \
  -d '{"postId":"68d9086a3aaa7d44d9b5b94d"}'

# Response: {"message":"Vui lòng đăng nhập"}
```

### **2. Kiểm tra Authentication:**
```javascript
// Frontend debug logs
console.log('🔖 Save Property Debug:', {
  isAuthenticated,  // false nếu chưa đăng nhập
  roomId: room._id, // Post ID từ frontend
  isSaved,
  favoriteId
});
```

### **3. Kiểm tra Backend Controller:**
```javascript
// server/src/controllers/SavedPropertiesController.js
async saveProperty(req, res, next) {
  const { postId, notes, tags } = req.body;
  
  // Check if post exists
  const post = await Post.findById(postId).populate('roomId');
  if (!post) {
    return error(res, 'Post not found', 404); // ← Lỗi này
  }
}
```

## 🎯 **Possible Solutions:**

### **Solution 1: User Authentication Required**
```typescript
// Frontend: Kiểm tra authentication trước khi gọi API
const handleSaveProperty = async () => {
  if (!isAuthenticated) {
    toastManager.showError('Vui lòng đăng nhập để lưu tin');
    return;
  }
  
  // Only proceed if authenticated
  await savedPropertiesApi.saveProperty(room._id);
};
```

### **Solution 2: Check Post Existence**
```typescript
// Frontend: Validate post exists before saving
const handleSaveProperty = async () => {
  try {
    // First check if post exists
    const postResponse = await postsApi.getPost(room._id);
    if (!postResponse.success) {
      toastManager.showError('Tin đăng không tồn tại');
      return;
    }
    
    // Then save to favorites
    await savedPropertiesApi.saveProperty(room._id);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **Solution 3: Backend Validation**
```javascript
// Backend: Better error handling
async saveProperty(req, res, next) {
  try {
    const { postId } = req.body;
    
    // Validate postId format
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return error(res, 'Invalid post ID', 400);
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return error(res, 'Post not found', 404);
    }
    
    // Check if post is active
    if (post.status !== 'active') {
      return error(res, 'Post is not available', 400);
    }
    
    // Continue with save logic...
  } catch (err) {
    return error(res, err.message, 500);
  }
}
```

## 🧪 **Testing Strategy:**

### **Test 1: Chưa đăng nhập**
```bash
# 1. Logout user
# 2. Click bookmark button
# 3. Expected: "Vui lòng đăng nhập để lưu tin"
# 4. No API call should be made
```

### **Test 2: Đã đăng nhập - Valid Post**
```bash
# 1. Login with valid account
# 2. Click bookmark on existing post
# 3. Expected: "Đã lưu tin thành công"
# 4. API call should succeed
```

### **Test 3: Đã đăng nhập - Invalid Post**
```bash
# 1. Login with valid account
# 2. Click bookmark on non-existent post
# 3. Expected: "Post not found" error
# 4. API call should fail gracefully
```

## 🔧 **Current Implementation:**

### **Frontend Debug Logs Added:**
```typescript
const handleSaveProperty = async () => {
  console.log('🔖 Save Property Debug:', {
    isAuthenticated,
    roomId: room._id,
    isSaved,
    favoriteId
  });

  if (!isAuthenticated) {
    // Show login required message
    return;
  }

  try {
    console.log('💾 Saving property...', { postId: room._id });
    const response = await savedPropertiesApi.saveProperty(room._id);
    console.log('✅ Save response:', response);
  } catch (error) {
    console.error('❌ Error saving property:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
  }
};
```

### **Next Steps:**
1. **Test với user đã đăng nhập**
2. **Kiểm tra console logs để xem exact error**
3. **Validate postId format và existence**
4. **Implement proper error handling**

## 🎯 **Expected Behavior:**

### **✅ Success Case:**
- User đã đăng nhập
- Post tồn tại trong database
- API call thành công
- UI updates correctly

### **❌ Error Cases:**
- User chưa đăng nhập → Show login prompt
- Post không tồn tại → Show "Post not found"
- Network error → Show "Có lỗi xảy ra khi lưu tin"

## 🚀 **Quick Fix:**

Để test ngay, hãy:
1. **Đăng nhập** với tài khoản bất kỳ
2. **Click bookmark button** trên một post
3. **Kiểm tra console logs** để xem debug info
4. **Report kết quả** để tôi có thể fix chính xác

**Lỗi này có thể do user chưa đăng nhập hoặc postId không hợp lệ!** 🔍


