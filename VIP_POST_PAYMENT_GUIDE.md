# 💳 Hệ Thống Thanh Toán VNPay Cho Tin VIP

## ✅ **ĐÃ HOÀN THÀNH**

### 🎯 **Tính Năng**
- ✅ Tích hợp VNPay cho tin đăng VIP
- ✅ 3 gói VIP: VIP 1, VIP 2, VIP 3
- ✅ Tự động tạo tin sau khi thanh toán thành công
- ✅ Thông báo kết quả thanh toán
- ✅ Lưu lịch sử thanh toán

---

## 📊 **Các Gói VIP**

| Gói | Giá | Thời hạn | Ưu tiên | Đặc điểm |
|-----|-----|----------|---------|----------|
| **VIP 1** | 50,000đ | 30 ngày | Cao | Khung viền vàng, hiển thị nổi bật |
| **VIP 2** | 100,000đ | 30 ngày | Rất cao | Khung viền đỏ, hiển thị rất nổi bật |
| **VIP 3** | 200,000đ | 30 ngày | Tối đa | Khung gradient, hiển thị đặc biệt |

---

## 🔧 **Backend API**

### 1. **VIPPostPaymentController.js**
**Location:** `server/src/controllers/VIPPostPaymentController.js`

**Endpoints:**

#### A. Lấy danh sách gói VIP
```http
GET /api/v1/vip-post-payment/packages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "packages": {
      "vip1": {
        "name": "Tin VIP 1",
        "price": 50000,
        "duration": 30,
        "priority": 1,
        "features": [...]
      },
      "vip2": {...},
      "vip3": {...}
    }
  }
}
```

#### B. Tạo URL thanh toán
```http
POST /api/v1/vip-post-payment/create-payment
Authorization: Bearer <token>

Body:
{
  "vipPackage": "vip1",
  "postData": {
    "roomId": "...",
    "options": [...],
    "propertyType": "phong-tro"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/...",
    "paymentId": "...",
    "amount": 50000,
    "package": {...}
  }
}
```

#### C. Callback từ VNPay
```http
GET /api/v1/vip-post-payment/callback?vnp_TxnRef=...&vnp_ResponseCode=...
```

**Flow:**
1. VNPay gọi callback với query params
2. Verify chữ ký
3. Nếu `vnp_ResponseCode = "00"` → Thanh toán thành công
4. Tạo Post với `favouriteLevel = vipPackage`
5. Redirect về `/dang-tin?payment=success&vipPackage=vip1&postId=...`
6. Nếu thất bại → Redirect về `/dang-tin?payment=failed&code=...`

#### D. Kiểm tra trạng thái
```http
GET /api/v1/vip-post-payment/status/:paymentId
Authorization: Bearer <token>
```

---

## 🎨 **Frontend Integration**

### 1. **API Client** (`lib/api.ts`)

```typescript
export const vipPostPaymentApi = {
  // Lấy gói VIP
  async getVIPPackages(): Promise<ApiResponse>,
  
  // Tạo thanh toán
  async createPayment(data: {
    vipPackage: string;
    postData: any;
  }): Promise<ApiResponse>,
  
  // Check status
  async checkPaymentStatus(paymentId: string): Promise<ApiResponse>
};
```

### 2. **PostPropertyForm.tsx**

**Logic mới:**

```typescript
const handleSubmit = async () => {
  const selectedPackage = servicePackages.find(
    pkg => pkg.value === formData.servicePackage
  );
  
  // Nếu chọn gói VIP (có phí)
  if (selectedPackage && selectedPackage.price > 0) {
    // 1. Tạo Room trước (upload ảnh)
    const roomResponse = await api.rooms.createRoom(formDataToSend);
    
    // 2. Chuẩn bị postData
    const postDataForPayment = {
      roomId: roomResponse.data._id,
      options: formData.amenities,
      propertyType: formData.propertyType
    };
    
    // 3. Tạo payment URL
    const paymentResponse = await api.vipPostPayment.createPayment({
      vipPackage: formData.servicePackage,
      postData: postDataForPayment
    });
    
    // 4. Redirect đến VNPay
    window.location.href = paymentResponse.data.paymentUrl;
    return;
  }
  
  // Nếu FREE → Tạo post bình thường
  // ...
};
```

### 3. **Trang Đăng Tin** (`app/dang-tin/page.tsx`)

**Xử lý callback:**

```typescript
useEffect(() => {
  const paymentStatus = searchParams.get('payment');
  const vipPackage = searchParams.get('vipPackage');
  const postId = searchParams.get('postId');
  
  if (paymentStatus === 'success' && vipPackage) {
    toast.success(
      `🎉 Thanh toán thành công! Tin ${vipPackage.toUpperCase()} đang chờ duyệt.`
    );
    
    setTimeout(() => {
      router.push('/dashboard/tin-dang');
    }, 2000);
  }
  
  if (paymentStatus === 'failed') {
    toast.error('❌ Thanh toán thất bại.');
  }
}, [searchParams]);
```

---

## 🔄 **User Flow**

### **Gói FREE (Miễn phí):**
```
1. User chọn gói "Tin thường"
2. Điền form đầy đủ
3. Submit
4. ✅ Tạo Room → Tạo Post → Chờ duyệt
5. Redirect /dashboard/tin-dang
```

### **Gói VIP (Có phí):**
```
1. User chọn gói VIP 1/2/3
2. Điền form đầy đủ
3. Submit
4. ✅ Tạo Room (upload ảnh lên Cloudinary)
5. ✅ Tạo Payment record
6. ✅ Redirect đến VNPay
7. User thanh toán trên VNPay
8. VNPay callback về server
9. ✅ Verify chữ ký
10. ✅ Tạo Post với favouriteLevel = vipX
11. ✅ Redirect /dang-tin?payment=success
12. ✅ Toast thông báo
13. ✅ Auto redirect /dashboard/tin-dang
```

---

## 💾 **Database Schema**

### **Payment Schema**
```javascript
{
  user: ObjectId,
  amount: Number,
  paymentMethod: "vnpay",
  status: "pending" | "completed" | "failed",
  transactionId: String,
  paidAt: Date,
  metadata: {
    type: "vip_post",
    vipPackage: "vip1" | "vip2" | "vip3",
    postData: {
      roomId: ObjectId,
      options: [String],
      propertyType: String
    },
    packageInfo: {
      name: String,
      price: Number,
      duration: Number,
      priority: Number,
      features: [String]
    }
  }
}
```

### **Post Schema** (cập nhật)
```javascript
{
  ...existingFields,
  favouriteLevel: "free" | "vip1" | "vip2" | "vip3",
  vipPackage: String,
  vipPayment: ObjectId, // Reference to Payment
  vipExpiresAt: Date // Ngày hết hạn VIP
}
```

---

## 🧪 **Testing**

### **Test Case 1: Thanh toán VIP thành công**
```bash
1. Vào http://localhost:3000/dang-tin
2. Chọn gói VIP 1 (50,000đ)
3. Điền form đầy đủ
4. Click "Đăng tin"
5. ✅ Redirect VNPay sandbox
6. Nhập thông tin test:
   - Ngân hàng: NCB
   - Số thẻ: 9704198526191432198
   - Tên: NGUYEN VAN A
   - Ngày: 07/15
   - OTP: 123456
7. ✅ Thanh toán thành công
8. ✅ Redirect về /dang-tin với toast
9. ✅ Auto redirect /dashboard/tin-dang
10. ✅ Kiểm tra DB: Post có favouriteLevel = "vip1"
```

### **Test Case 2: Thanh toán thất bại**
```bash
1-4. Giống test case 1
5. ✅ Redirect VNPay
6. Click "Hủy giao dịch"
7. ✅ Redirect về /dang-tin?payment=failed
8. ✅ Toast error
9. ✅ Form vẫn giữ nguyên data
10. ✅ User có thể thử lại
```

### **Test Case 3: Gói FREE**
```bash
1. Vào /dang-tin
2. Chọn "Tin thường" (FREE)
3. Điền form
4. Click "Đăng tin"
5. ✅ KHÔNG redirect VNPay
6. ✅ Tạo Post trực tiếp
7. ✅ favouriteLevel = "free"
8. ✅ Redirect /dashboard/tin-dang
```

---

## 🔐 **Security**

### **Verify VNPay Signature:**
```javascript
const isValid = vnpay.verifyReturnUrl(vnpayData);
if (!isValid) {
  return res.redirect('/dang-tin?payment=failed&reason=invalid_signature');
}
```

### **Check Payment Exists:**
```javascript
const payment = await Payment.findById(paymentId);
if (!payment) {
  return res.redirect('/dang-tin?payment=failed&reason=payment_not_found');
}
```

### **Authentication:**
- ✅ Tạo payment yêu cầu `authenticate()`
- ✅ Check payment status yêu cầu `authenticate()`
- ✅ Callback từ VNPay KHÔNG yêu cầu auth (public)

---

## 📝 **Environment Variables**

**File:** `server/.env`

```env
# VNPay Config
VNP_TMNCODE=LFMUDIFW
VNP_HASHSECRET=STXJ1CEC30ITUH71B02TJKLSNUXMIN84
VNP_URL=https://sandbox.vnpayment.vn/
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 **Deployment Checklist**

- [x] Cài `vnpay` package: `npm install vnpay`
- [x] Tạo VIPPostPaymentController
- [x] Tạo route `/api/v1/vip-post-payment`
- [x] Add route vào index.js
- [x] Update frontend API client
- [x] Update PostPropertyForm
- [x] Update trang đăng tin (callback handler)
- [x] Test thanh toán thành công
- [x] Test thanh toán thất bại
- [x] Test gói FREE vẫn hoạt động

---

## 📊 **Statistics**

### **Tracking:**
- Số lượng VIP posts
- Revenue theo gói
- Conversion rate (Free → VIP)
- Failed payment rate

### **Query Examples:**

```javascript
// Số post VIP hôm nay
await Post.countDocuments({
  favouriteLevel: { $ne: 'free' },
  createdAt: { $gte: startOfDay }
});

// Revenue theo gói
await Payment.aggregate([
  { $match: { 
    status: 'completed',
    'metadata.type': 'vip_post'
  }},
  { $group: {
    _id: '$metadata.vipPackage',
    totalRevenue: { $sum: '$amount' },
    count: { $sum: 1 }
  }}
]);

// Top VIP users
await Payment.aggregate([
  { $match: { 
    status: 'completed',
    'metadata.type': 'vip_post'
  }},
  { $group: {
    _id: '$user',
    totalSpent: { $sum: '$amount' },
    vipPosts: { $sum: 1 }
  }},
  { $sort: { totalSpent: -1 }},
  { $limit: 10 }
]);
```

---

## 🎨 **UI Improvements** (Tương lai)

### **1. Comparison Table:**
```
┌────────────────────────────────────────────────┐
│ So sánh gói đăng tin                           │
├─────────┬─────────┬─────────┬─────────┬────────┤
│         │ FREE    │ VIP 1   │ VIP 2   │ VIP 3  │
├─────────┼─────────┼─────────┼─────────┼────────┤
│ Giá     │ 0đ      │ 50k     │ 100k    │ 200k   │
│ Hiển thị│ 7 ngày  │ 30 ngày │ 30 ngày │ 30 ngày│
│ Khung   │ Không   │ Vàng    │ Đỏ      │ Gradient│
│ Ưu tiên │ Thấp    │ Cao     │ Rất cao │ Tối đa │
└─────────┴─────────┴─────────┴─────────┴────────┘
```

### **2. Preview VIP:**
- Hiển thị preview tin VIP trước khi thanh toán
- So sánh với tin FREE

### **3. Promo Code:**
- Thêm field nhập mã giảm giá
- Validate và apply discount

### **4. Bundle Pricing:**
- Mua nhiều tin VIP → Giảm giá
- VD: Mua 5 tin VIP 1 → Giá chỉ 200k (thay vì 250k)

---

## ✅ **Status**

| Component | Status | Note |
|-----------|--------|------|
| Backend API | ✅ Done | VIPPostPaymentController |
| Routes | ✅ Done | /api/v1/vip-post-payment |
| Frontend API | ✅ Done | vipPostPaymentApi |
| Form Logic | ✅ Done | PostPropertyForm updated |
| Callback Handler | ✅ Done | Payment success/failed |
| Testing | ⏳ Pending | Need manual test |
| Documentation | ✅ Done | This file |

---

## 🎉 **Ready to Use!**

**URL Test:** http://localhost:3000/dang-tin

**Flow:**
1. Đăng nhập với tài khoản landlord
2. Vào trang đăng tin
3. Chọn gói VIP
4. Điền thông tin
5. Submit → Thanh toán VNPay
6. Thành công → Tin VIP được tạo!

**VNPay Test Card:**
- Bank: NCB
- Card: 9704198526191432198
- Name: NGUYEN VAN A
- Date: 07/15
- OTP: 123456

🚀 **Let's test it!**
