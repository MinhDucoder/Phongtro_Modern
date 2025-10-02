# 🔐 Role-Based Access Control (RBAC) System

## 📋 **Định nghĩa các Role trong hệ thống:**

### **1. 👤 USER (Người tìm trọ)**
- **Mô tả**: Người dùng thông thường, tìm kiếm phòng trọ
- **Quyền hạn**: Xem tin đăng, tìm kiếm, liên hệ chủ trọ
- **Hạn chế**: Không thể đăng tin, quản lý phòng

### **2. 🏠 LANDLORD (Chủ trọ)**
- **Mô tả**: Chủ nhà, người cho thuê phòng
- **Quyền hạn**: Đăng tin, quản lý phòng, xem thống kê
- **Hạn chế**: Không thể quản lý hệ thống

### **3. 👑 ADMIN (Quản trị viên)**
- **Mô tả**: Quản lý toàn bộ hệ thống
- **Quyền hạn**: Tất cả quyền, quản lý user, duyệt tin
- **Hạn chế**: Không có

## 🎯 **Phân quyền chi tiết theo trang/tính năng:**

### **📄 PUBLIC PAGES (Không cần đăng nhập):**
- `/` - Trang chủ
- `/phong-tro` - Danh sách phòng trọ
- `/nha-nguyen-can` - Nhà nguyên căn
- `/can-ho` - Căn hộ
- `/tim-kiem` - Tìm kiếm
- `/o-ghep` - Ở ghép
- `/mat-bang` - Mặt bằng
- `/blog` - Blog
- `/bang-gia` - Bảng giá
- `/dang-nhap` - Đăng nhập
- `/dang-ky` - Đăng ký
- `/quen-mat-khau` - Quên mật khẩu

### **🔒 AUTHENTICATED PAGES (Cần đăng nhập):**
- `/profile` - Thông tin cá nhân
- `/yeu-cau-da-gui` - Yêu cầu đã gửi
- `/lich-hen` - Lịch hẹn
- `/thanh-toan` - Thanh toán
- `/thanh-toan-thue-phong` - Thanh toán thuê phòng
- `/tom-tat-don-hang` - Tóm tắt đơn hàng
- `/ket-qua-thanh-toan` - Kết quả thanh toán
- `/thong-bao` - Thông báo
- `/chat` - Chat

### **🏠 LANDLORD ONLY PAGES:**
- `/dang-tin` - Đăng tin
- `/dashboard` - Dashboard chủ trọ
- `/dashboard/quan-ly-tin` - Quản lý tin đăng
- `/dashboard/thong-ke` - Thống kê chủ trọ
- `/dashboard/lich-hen` - Lịch hẹn chủ trọ
- `/dashboard/thanh-toan` - Thanh toán chủ trọ

### **👑 ADMIN ONLY PAGES:**
- `/admin` - Dashboard admin
- `/admin/quan-ly-user` - Quản lý người dùng
- `/admin/quan-ly-tin` - Quản lý tin đăng
- `/admin/duyet-tin` - Duyệt tin đăng
- `/admin/thong-ke` - Thống kê hệ thống
- `/admin/cai-dat` - Cài đặt hệ thống
- `/analytics` - Analytics dashboard

## 🛠️ **Implementation Plan:**

### **Backend (Server-side):**
1. ✅ **Role Middleware** - Đã có `checkRole.js`
2. ✅ **Authentication Middleware** - Đã có `authenticate.js`
3. 🔄 **Route Protection** - Cần cập nhật routes
4. 🔄 **Permission System** - Cần tạo permission matrix

### **Frontend (Client-side):**
1. ✅ **AuthContext** - Đã có
2. ✅ **AdminGuard** - Đã có
3. 🔄 **RoleGuard** - Cần tạo
4. 🔄 **Navigation Protection** - Cần cập nhật
5. 🔄 **Component Protection** - Cần tạo guards

## 🎨 **UI/UX Features:**

### **Navigation:**
- **Public**: Hiển thị đầy đủ menu
- **User**: Ẩn "Đăng tin", hiển thị "Dashboard" nếu là landlord
- **Landlord**: Hiển thị "Đăng tin", "Dashboard"
- **Admin**: Hiển thị "Admin", "Analytics"

### **Buttons/Actions:**
- **"Đăng tin"**: Chỉ hiển thị với landlord
- **"Quản lý"**: Chỉ hiển thị với landlord/admin
- **"Admin"**: Chỉ hiển thị với admin

### **Error Handling:**
- **401**: "Vui lòng đăng nhập"
- **403**: "Bạn không có quyền truy cập"
- **Redirect**: Chuyển hướng phù hợp

## 🚀 **Next Steps:**

1. **Tạo RoleGuard component**
2. **Cập nhật navigation theo role**
3. **Protect routes theo role**
4. **Test với các role khác nhau**
5. **Tạo permission matrix**


