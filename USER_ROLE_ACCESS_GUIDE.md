# 🔐 User Role Access Guide

## 👤 **Role `user` có thể truy cập các link sau:**

### **✅ PUBLIC PAGES (Không cần đăng nhập):**

#### **🏠 Trang chính:**
- **`/`** - Trang chủ (Homepage)
- **`/phong-tro`** - Danh sách phòng trọ
- **`/nha-nguyen-can`** - Danh sách nhà nguyên căn  
- **`/can-ho`** - Danh sách căn hộ
- **`/tim-kiem`** - Tìm kiếm
- **`/o-ghep`** - Ở ghép
- **`/mat-bang`** - Mặt bằng
- **`/blog`** - Blog
- **`/bang-gia`** - Bảng giá

#### **🔐 Authentication:**
- **`/dang-nhap`** - Đăng nhập
- **`/dang-ky`** - Đăng ký
- **`/quen-mat-khau`** - Quên mật khẩu

#### **🧪 Debug/Test:**
- **`/test-roles`** - Test roles (có thể truy cập nhưng sẽ hiển thị thông tin khác nhau)

---

### **🔒 AUTHENTICATED PAGES (Cần đăng nhập - Role `user` có thể truy cập):**

#### **👤 User Profile & Settings:**
- **`/profile`** - Trang cá nhân (AuthRequired)
- **`/chat`** - Chat với chủ trọ (AuthRequired)
- **`/thong-bao`** - Thông báo (AuthRequired)

#### **💰 Payment & Booking:**
- **`/thanh-toan`** - Thanh toán (AuthRequired)
- **`/lich-hen`** - Lịch hẹn xem phòng (AuthRequired)
- **`/yeu-cau-da-gui`** - Yêu cầu đã gửi (AuthRequired)

#### **📋 Order Management:**
- **`/tom-tat-don-hang`** - Tóm tắt đơn hàng
- **`/ket-qua-thanh-toan`** - Kết quả thanh toán

---

### **❌ RESTRICTED PAGES (Role `user` KHÔNG thể truy cập):**

#### **🏢 Landlord Only:**
- **`/dashboard`** - Dashboard chủ trọ (LandlordOnly)
- **`/dang-tin`** - Đăng tin cho thuê (LandlordOnly)

#### **👑 Admin Only:**
- **`/admin`** - Admin dashboard (AdminOnly)
- **`/analytics`** - Analytics dashboard (AdminOnly)

---

## 🎯 **Navigation Menu cho Role `user`:**

### **📱 Main Navigation (Luôn hiển thị):**
```javascript
const mainNavigation = [
  { name: 'Phòng trọ', href: '/phong-tro' },
  { name: 'Nhà nguyên căn', href: '/nha-nguyen-can' },
  { name: 'Căn hộ', href: '/can-ho' },
  { name: 'Tìm kiếm', href: '/tim-kiem' },
];
```

### **🔗 Secondary Navigation (Luôn hiển thị):**
```javascript
const secondaryNavigation = [
  { name: 'Ở ghép', href: '/o-ghep' },
  { name: 'Mặt bằng', href: '/mat-bang' },
  { name: 'Blog', href: '/blog' },
  { name: 'Bảng giá', href: '/bang-gia' },
  { name: 'Test Roles', href: '/test-roles' },
];
```

### **👤 User Menu (Khi đã đăng nhập):**
```javascript
// Hiển thị khi isAuthenticated = true
- Profile
- Chat  
- Thông báo
- Thanh toán
- Lịch hẹn
- Yêu cầu đã gửi
- Đăng xuất
```

---

## 🧪 **Test Role `user` Access:**

### **Test 1: Chưa đăng nhập**
```bash
# Truy cập các trang public
✅ / - Trang chủ
✅ /phong-tro - Phòng trọ
✅ /dang-nhap - Đăng nhập
✅ /dang-ky - Đăng ký

# Truy cập các trang cần đăng nhập
❌ /profile - Redirect to /dang-nhap
❌ /chat - Redirect to /dang-nhap
❌ /dashboard - Redirect to /dang-nhap
❌ /admin - Redirect to /dang-nhap
```

### **Test 2: Đã đăng nhập với role `user`**
```bash
# Truy cập các trang public
✅ / - Trang chủ
✅ /phong-tro - Phòng trọ

# Truy cập các trang user có thể dùng
✅ /profile - Trang cá nhân
✅ /chat - Chat
✅ /thong-bao - Thông báo
✅ /thanh-toan - Thanh toán
✅ /lich-hen - Lịch hẹn
✅ /yeu-cau-da-gui - Yêu cầu đã gửi

# Truy cập các trang bị hạn chế
❌ /dashboard - Redirect to /
❌ /dang-tin - Redirect to /
❌ /admin - Redirect to /
❌ /analytics - Redirect to /
```

---

## 🔧 **Implementation Details:**

### **1. Protected Route Components:**
```typescript
// AuthRequired - Cần đăng nhập (user, landlord, admin)
<AuthRequired>
  <ProfilePage />
</AuthRequired>

// LandlordOnly - Chỉ landlord và admin
<LandlordOnly>
  <DashboardPage />
</LandlordOnly>

// AdminOnly - Chỉ admin
<AdminOnly>
  <AdminPage />
</AdminOnly>
```

### **2. Role Check Hook:**
```typescript
const { isUser, isLandlord, isAdmin } = useRoleCheck();

// Role hierarchy:
// user: ['user', 'landlord', 'admin']
// landlord: ['landlord', 'admin']  
// admin: ['admin']
```

### **3. Navigation Logic:**
```typescript
// Main navigation - Always visible
{mainNavigation.map(item => <Link />)}

// Role-based navigation - Conditional
{isLandlord() && landlordNavigation.map(item => <Link />)}
{isAdmin() && adminNavigation.map(item => <Link />)}
```

---

## 📋 **Summary:**

### **✅ Role `user` có thể:**
- ✅ Xem tất cả trang public
- ✅ Đăng nhập/đăng ký
- ✅ Truy cập profile, chat, thông báo
- ✅ Thanh toán, đặt lịch hẹn
- ✅ Xem yêu cầu đã gửi
- ✅ Lưu tin đăng (bookmark)

### **❌ Role `user` KHÔNG thể:**
- ❌ Truy cập dashboard chủ trọ
- ❌ Đăng tin cho thuê
- ❌ Truy cập admin panel
- ❌ Xem analytics dashboard

### **🎯 Key Features for User:**
- **Browse Properties**: Xem phòng trọ, nhà, căn hộ
- **Search & Filter**: Tìm kiếm theo tiêu chí
- **Save Properties**: Lưu tin yêu thích
- **Contact Landlords**: Chat với chủ trọ
- **Book Viewings**: Đặt lịch xem phòng
- **Make Payments**: Thanh toán
- **Track Requests**: Theo dõi yêu cầu

**Role `user` có đầy đủ quyền để sử dụng hệ thống như một khách thuê!** 🎉


