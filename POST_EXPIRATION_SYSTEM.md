# 📋 Hệ Thống Quản Lý Thời Hạn Tin Đăng

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **Post Schema - Thêm Thời Hạn**
**File:** `server/src/models/postSchema.js`

**Fields mới:**
```javascript
{
  // Ngày hết hạn tin đăng
  expiresAt: Date (required, indexed),
  
  // Số ngày tin đăng có hiệu lực
  postDuration: Number (default: 30),
  
  // Cho phép gia hạn không
  canExtend: Boolean (default: true),
  
  // Số lần đã gia hạn
  extendedCount: Number (default: 0),
  
  // Lịch sử gia hạn
  extensionHistory: [{
    extendedAt: Date,
    extendedBy: ObjectId,
    addedDays: Number,
    newExpiryDate: Date
  }]
}
```

### 2. **Package Plan Schema - Thêm Cấu Hình Thời Hạn**
**File:** `server/src/models/packagePlanSchema.js`

**Fields mới:**
```javascript
{
  // Số ngày mỗi tin đăng tồn tại
  postDuration: Number (required, default: 30),
  
  // Cho phép gia hạn tin
  allowExtension: Boolean (default: true),
  
  // Số lần gia hạn tối đa
  maxExtensions: Number (default: 3)
}
```

**Gói đề xuất:**

| Gói | Giá | Hiệu lực gói | Số tin | Mỗi tin hiển thị | Gia hạn | Ưu tiên |
|-----|-----|--------------|--------|------------------|---------|---------|
| **Miễn phí** | 0đ | 30 ngày | 3 tin | 7 ngày | ❌ Không | Thấp |
| **Bạc** | 50,000đ | 30 ngày | 10 tin | 30 ngày | ✅ 2 lần | Trung bình |
| **Vàng** | 100,000đ | 90 ngày | 30 tin | 60 ngày | ✅ 3 lần | Cao |
| **Bạch Kim** | 200,000đ | 180 ngày | 100 tin | 90 ngày | ✅ 5 lần | Rất cao |

### 3. **Post Service - Tự Động Set Thời Hạn**
**File:** `server/src/services/postService.js`

**Logic tạo post:**
```javascript
// Lấy postDuration từ package plan
const postDuration = subscription.packagePlan?.postDuration || 30;

// Tính ngày hết hạn
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + postDuration);

// Tạo post với thời hạn
await Post.create({
  ...postData,
  expiresAt: expiresAt,
  postDuration: postDuration,
  canExtend: subscription.packagePlan?.allowExtension || false
});
```

### 4. **Post Expiration Service - Cron Job**
**File:** `server/src/services/postExpirationService.js`

**Tính năng:**

#### A. Auto-Expire Posts (Chạy mỗi giờ)
```javascript
// Tự động chuyển status: active → expired
// khi expiresAt < now
cron.schedule("0 * * * *", async () => {
  await Post.updateMany(
    { status: "active", expiresAt: { $lt: new Date() } },
    { $set: { status: "expired" } }
  );
});
```

#### B. Extend Post (Gia hạn tin)
```javascript
// User có thể gia hạn tin thêm 30 ngày
// Giới hạn theo maxExtensions của gói
await extendPost(postId, userId, additionalDays);
```

#### C. Get Expiring Posts (Tin sắp hết hạn)
```javascript
// Lấy tin sắp hết hạn trong 3 ngày
await getPostsExpiringWithinDays(3);
// → Dùng để gửi email nhắc nhở
```

#### D. Cleanup Old Posts (Dọn dẹp)
```javascript
// Xóa tin expired quá 90 ngày
await cleanupOldExpiredPosts(90);
```

#### E. Post Statistics
```javascript
// Thống kê tin đăng
await getPostStats();
// → {
//   totalActive,
//   totalExpired,
//   totalPending,
//   expiringIn3Days,
//   expiringIn7Days
// }
```

### 5. **Server Integration**
**File:** `server/src/server.js`

**Khởi động cron job:**
```javascript
import postExpirationService from "./services/postExpirationService.js";

httpServer.listen(apiPort, () => {
  // Khởi động auto-expire cron job
  postExpirationService.startExpirationCronJob();
});
```

## 📊 So Sánh Hệ Thống

### ❌ **Trước đây:**
- ✗ Tin đăng tồn tại vĩnh viễn
- ✗ Không có khái niệm "hết hạn"
- ✗ Người dùng đăng 1 lần, hiển thị mãi mãi
- ✗ Không công bằng với gói trả phí
- ✗ Database đầy tin cũ

### ✅ **Bây giờ:**
- ✅ Mỗi tin có thời hạn rõ ràng
- ✅ Tự động expire khi hết hạn
- ✅ Phân biệt rõ giá trị các gói
- ✅ User phải gia hạn hoặc đăng mới
- ✅ Database luôn có tin mới

## 🎯 User Experience

### **Gói Miễn Phí:**
```
User đăng 3 tin
→ Mỗi tin hiển thị 7 ngày
→ Sau 7 ngày → Expired
→ Không thể gia hạn
→ Phải đăng tin mới (nếu còn lượt)
```

### **Gói Bạc (50k):**
```
User đăng 10 tin
→ Mỗi tin hiển thị 30 ngày
→ Sắp hết hạn → Thông báo gia hạn
→ Gia hạn được 2 lần (mỗi lần +30 ngày)
→ Tối đa: 30 + 30 + 30 = 90 ngày/tin
```

### **Gói Vàng (100k):**
```
User đăng 30 tin
→ Mỗi tin hiển thị 60 ngày
→ Gia hạn được 3 lần (+60 ngày/lần)
→ Tối đa: 60 + 60 + 60 + 60 = 240 ngày/tin
```

### **Gói Bạch Kim (200k):**
```
User đăng 100 tin
→ Mỗi tin hiển thị 90 ngày
→ Gia hạn được 5 lần (+90 ngày/lần)
→ Tối đa: 90 + 90*5 = 540 ngày/tin
```

## 🔔 Thông Báo Tự Động

### **Email nhắc nhở:**
1. **3 ngày trước hết hạn:**
   - "Tin đăng của bạn sắp hết hạn"
   - Link gia hạn nhanh

2. **1 ngày trước hết hạn:**
   - "Tin đăng hết hạn vào ngày mai"
   - Khuyến khích gia hạn

3. **Khi hết hạn:**
   - "Tin đăng đã hết hạn"
   - Link đăng tin mới

## 📈 Benefits

### **Cho Platform:**
- ✅ Tăng revenue (user phải gia hạn hoặc mua gói mới)
- ✅ Database luôn có tin mới, chất lượng
- ✅ Không có tin spam cũ
- ✅ Tăng engagement (user quay lại thường xuyên)

### **Cho User:**
- ✅ Minh bạch về thời hạn
- ✅ Linh hoạt gia hạn
- ✅ Giá trị rõ ràng từng gói
- ✅ Không mất công đăng lại từ đầu (chỉ cần extend)

### **Cho Người Tìm Phòng:**
- ✅ Chỉ thấy tin còn hiệu lực
- ✅ Tin luôn mới, cập nhật
- ✅ Không lãng phí thời gian với tin cũ
- ✅ Tăng tỷ lệ liên hệ thành công

## 🛠️ Cần Làm Tiếp

### **Backend:**
- [ ] Cài package `node-cron`: `npm install node-cron`
- [ ] Add route gia hạn tin: `POST /api/v1/posts/:id/extend`
- [ ] Add email notification service
- [ ] Seed lại database với gói mới

### **Frontend:**
- [ ] Hiển thị ngày hết hạn trên mỗi tin
- [ ] Button "Gia hạn" cho tin sắp hết hạn
- [ ] Badge "Sắp hết hạn" (< 3 ngày)
- [ ] Modal confirm gia hạn
- [ ] Dashboard: Tab "Tin hết hạn"

### **Cron Jobs:**
- [x] Auto-expire posts mỗi giờ
- [ ] Email nhắc 3 ngày trước
- [ ] Email nhắc 1 ngày trước
- [ ] Email thông báo đã hết hạn
- [ ] Cleanup expired posts > 90 ngày

## 🎨 UI Suggestions

### **Danh sách tin đăng:**
```
┌─────────────────────────────────────┐
│ [Ảnh] Phòng trọ giá rẻ             │
│       3.5tr/tháng - 25m²            │
│       📅 Còn 5 ngày                 │ ← Badge màu vàng
│       [Gia hạn] [Sửa] [Xóa]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [Ảnh] Căn hộ full nội thất         │
│       5tr/tháng - 40m²              │
│       📅 Còn 25 ngày                │ ← Badge màu xanh
│       [Sửa] [Xóa]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [Ảnh] Nhà nguyên căn                │
│       10tr/tháng - 100m²            │
│       ⚠️ Hết hạn 2 ngày trước       │ ← Badge màu đỏ
│       [Đăng lại] [Xóa]              │
└─────────────────────────────────────┘
```

### **Modal Gia Hạn:**
```
┌───────────────────────────────────────┐
│  Gia Hạn Tin Đăng                     │
├───────────────────────────────────────┤
│                                       │
│  Tin: "Phòng trọ giá rẻ..."          │
│  Hết hạn: 15/10/2025                  │
│  Đã gia hạn: 1/2 lần                  │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ ⭕ +30 ngày (Miễn phí)          │ │
│  │    Hết hạn mới: 14/11/2025      │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [Hủy]           [Xác Nhận Gia Hạn] │
└───────────────────────────────────────┘
```

## 🚀 Deploy Checklist

1. **Cài dependencies:**
   ```bash
   cd server
   npm install node-cron
   ```

2. **Update database:**
   ```bash
   # Thêm expiresAt cho posts hiện tại
   db.posts.updateMany(
     { expiresAt: { $exists: false } },
     { $set: { 
       expiresAt: new Date(Date.now() + 30*24*60*60*1000),
       postDuration: 30,
       canExtend: true,
       extendedCount: 0
     }}
   )
   ```

3. **Seed lại packages:**
   ```bash
   # Xóa packages cũ
   db.packageplans.deleteMany({})
   # Restart server để auto-seed
   npm run dev
   ```

4. **Test cron job:**
   ```bash
   # Check logs mỗi giờ
   # Nên thấy: "✅ Post expiration cron job started"
   ```

## 📝 Notes

- Cron job chạy mỗi giờ (`0 * * * *`)
- Có thể điều chỉnh tần suất nếu cần
- Email service cần setup riêng
- Xem xét add webhook cho realtime update

---

**Status:** ✅ Backend hoàn thành, cần cài `node-cron` và test
**Next:** Frontend UI cho gia hạn tin
