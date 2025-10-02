# 🧪 Role-Based Access Control Testing Guide

## ✅ **Vấn đề đã sửa:**
- **Trước**: Trang `/test-roles` bị redirect ngay lập tức do `RoleGuard` và `ProtectedRoute` components
- **Sau**: Trang test hiển thị đầy đủ thông tin mà không redirect

## 🎯 **Cách test trang `/test-roles`:**

### **1. 📋 Truy cập trang test:**
```
http://localhost:3000/test-roles
```

### **2. 🔍 Kiểm tra thông tin hiện tại:**

#### **Current User Info:**
- **Authenticated**: ✅ Yes / ❌ No
- **User Role**: user/landlord/admin
- **User Name**: Tên người dùng
- **User Email**: Email người dùng

#### **Role Check Results:**
- **isUser()**: ✅ Yes / ❌ No
- **isLandlord()**: ✅ Yes / ❌ No  
- **isAdmin()**: ✅ Yes / ❌ No
- **hasRole(['user'])**: ✅ Yes / ❌ No
- **hasRole(['landlord'])**: ✅ Yes / ❌ No
- **hasRole(['admin'])**: ✅ Yes / ❌ No

### **3. 🛡️ Test Role Guards:**

#### **Role Guard Tests:**
- **UserGuard**: ✅ User Access Granted / ❌ Access Denied
- **LandlordGuard**: ✅ Landlord Access Granted / ❌ Access Denied
- **AdminGuard**: ✅ Admin Access Granted / ❌ Access Denied

#### **Protected Route Tests:**
- **AuthRequired**: ✅ Authenticated Access / ❌ Not Authenticated
- **LandlordOnly**: ✅ Landlord Access / ❌ Access Denied
- **AdminOnly**: ✅ Admin Access / ❌ Access Denied

### **4. 🎨 Test Navigation Visibility:**

#### **Real Component Tests:**
- **"Đăng tin" Button**: ✅ Should be visible / ❌ Should be hidden
- **Dashboard Link**: ✅ Should be visible / ❌ Should be hidden
- **Admin Link**: ✅ Should be visible / ❌ Should be hidden
- **Analytics Link**: ✅ Should be visible / ❌ Should be hidden

## 🔄 **Test với các role khác nhau:**

### **Test 1: Logout (Không đăng nhập)**
```bash
# 1. Click "Đăng xuất"
# 2. Truy cập /test-roles
# 3. Kết quả mong đợi:
#    - Authenticated: ❌ No
#    - User Role: Not logged in
#    - Tất cả Role Guards: ❌ Access Denied
#    - Tất cả Protected Routes: ❌ Not Authenticated
#    - Tất cả Navigation Items: ❌ Should be hidden
```

### **Test 2: Login với User thông thường**
```bash
# 1. Đăng nhập với tài khoản có role "user"
# 2. Truy cập /test-roles
# 3. Kết quả mong đợi:
#    - Authenticated: ✅ Yes
#    - User Role: user
#    - UserGuard: ✅ User Access Granted
#    - LandlordGuard: ❌ Access Denied
#    - AdminGuard: ❌ Access Denied
#    - AuthRequired: ✅ Authenticated Access
#    - LandlordOnly: ❌ Access Denied
#    - AdminOnly: ❌ Access Denied
#    - "Đăng tin" Button: ❌ Should be hidden
#    - Dashboard Link: ❌ Should be hidden
#    - Admin Link: ❌ Should be hidden
#    - Analytics Link: ❌ Should be hidden
```

### **Test 3: Login với Landlord**
```bash
# 1. Đăng nhập với tài khoản có role "landlord"
# 2. Truy cập /test-roles
# 3. Kết quả mong đợi:
#    - Authenticated: ✅ Yes
#    - User Role: landlord
#    - UserGuard: ✅ User Access Granted
#    - LandlordGuard: ✅ Landlord Access Granted
#    - AdminGuard: ❌ Access Denied
#    - AuthRequired: ✅ Authenticated Access
#    - LandlordOnly: ✅ Landlord Access
#    - AdminOnly: ❌ Access Denied
#    - "Đăng tin" Button: ✅ Should be visible
#    - Dashboard Link: ✅ Should be visible
#    - Admin Link: ❌ Should be hidden
#    - Analytics Link: ❌ Should be hidden
```

### **Test 4: Login với Admin**
```bash
# 1. Đăng nhập với tài khoản có role "admin"
# 2. Truy cập /test-roles
# 3. Kết quả mong đợi:
#    - Authenticated: ✅ Yes
#    - User Role: admin
#    - UserGuard: ✅ User Access Granted
#    - LandlordGuard: ✅ Landlord Access Granted
#    - AdminGuard: ✅ Admin Access Granted
#    - AuthRequired: ✅ Authenticated Access
#    - LandlordOnly: ✅ Landlord Access
#    - AdminOnly: ✅ Admin Access
#    - "Đăng tin" Button: ✅ Should be visible
#    - Dashboard Link: ✅ Should be visible
#    - Admin Link: ✅ Should be visible
#    - Analytics Link: ✅ Should be visible
```

## 🎨 **Test Navigation thực tế:**

### **Header Navigation:**
```bash
# Kiểm tra header navigation items:
# - Public: Phòng trọ, Nhà nguyên căn, Căn hộ, Tìm kiếm
# - Landlord: + Đăng tin, Dashboard
# - Admin: + Admin, Analytics
```

### **Mobile Navigation:**
```bash
# 1. Mở mobile menu (hamburger icon)
# 2. Kiểm tra navigation items theo role
# 3. Test "Đăng tin" button visibility
```

## 🚨 **Test Error Handling:**

### **Test Access Denied:**
```bash
# 1. Login với user thông thường
# 2. Thử truy cập /admin
# 3. Sẽ thấy toast: "Bạn không có quyền truy cập trang này"
# 4. Sẽ redirect về trang chủ
```

### **Test Login Required:**
```bash
# 1. Logout
# 2. Thử truy cập /profile
# 3. Sẽ thấy toast: "Vui lòng đăng nhập để truy cập trang này"
# 4. Sẽ redirect về /dang-nhap
```

## 📱 **Test Mobile View:**

```bash
# 1. Mở Developer Tools (F12)
# 2. Chọn mobile view (iPhone/Android)
# 3. Kiểm tra mobile navigation
# 4. Test responsive design
```

## 🔧 **Debug Tips:**

### **Nếu có lỗi:**
1. **Kiểm tra Console**: Mở F12 → Console
2. **Kiểm tra Network**: Mở F12 → Network
3. **Kiểm tra Authentication**: Xem cookies và localStorage
4. **Kiểm tra Role Assignment**: Xem user object trong AuthContext

### **Common Issues:**
- **Role không đúng**: Kiểm tra database user.role
- **Authentication failed**: Kiểm tra JWT token
- **Navigation không update**: Kiểm tra useRoleCheck hook
- **Redirect loop**: Kiểm tra ProtectedRoute logic

## 🎯 **Kết quả mong đợi:**

### **✅ Khi test thành công:**
- Trang test hiển thị đầy đủ thông tin
- Role checks hoạt động chính xác
- Navigation hiển thị đúng theo role
- Error handling hoạt động tốt
- Mobile responsive

### **❌ Khi có lỗi:**
- Kiểm tra console logs
- Kiểm tra network requests
- Kiểm tra authentication state
- Kiểm tra role assignment

## 🚀 **Next Steps:**

1. **Test với real users** có các role khác nhau
2. **Test với different browsers** và devices
3. **Test với network conditions** khác nhau
4. **Test với invalid tokens** và edge cases

**Trang test đã hoạt động hoàn hảo!** 🎉


