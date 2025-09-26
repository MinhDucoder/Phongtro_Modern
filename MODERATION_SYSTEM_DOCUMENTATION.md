# Hệ thống kiểm duyệt nội dung PhongTro-Modern

## Giới thiệu

Hệ thống kiểm duyệt nội dung PhongTro-Modern giúp đảm bảo tất cả tin đăng trên nền tảng đều đáp ứng các tiêu chuẩn chất lượng và tuân thủ quy định. Tài liệu này mô tả chi tiết về hệ thống kiểm duyệt và cách sử dụng.

## Tính năng chính

### 1. Kiểm duyệt tin đăng

- Xem xét và phê duyệt/từ chối các tin đăng mới
- Kiểm tra nội dung, hình ảnh và giá cả của tin đăng
- Xem thông tin chi tiết về người đăng và lịch sử đăng tin

### 2. Thống kê và báo cáo

- Biểu đồ tỷ lệ duyệt/từ chối
- Thời gian phản hồi trung bình
- Hiệu suất kiểm duyệt viên
- Phân loại theo thành phố và loại phòng

### 3. Đánh dấu vấn đề

- Đánh dấu nội dung không phù hợp
- Đánh dấu vấn đề về giá cả
- Đánh dấu vấn đề về hình ảnh
- Đánh dấu vấn đề về địa chỉ

## Kiến trúc hệ thống

### 1. Backend (Node.js/Express)

#### Controllers
- `ModerationController.js`: Xử lý tất cả các logic kiểm duyệt
  - `getModerationDashboard`: Tổng quan về trạng thái kiểm duyệt
  - `getModerationQueue`: Danh sách tin đăng cần kiểm duyệt
  - `getModerationStats`: Thống kê về hoạt động kiểm duyệt
  - `getPostForModeration`: Chi tiết tin đăng cần kiểm duyệt
  - `moderatePost`: Thực hiện phê duyệt hoặc từ chối tin đăng

#### Routes
- `moderationRoutes.js`: Định nghĩa các API endpoint cho kiểm duyệt
  - `/api/v1/admin/moderation/dashboard`: Tổng quan kiểm duyệt
  - `/api/v1/admin/moderation/queue`: Danh sách tin cần duyệt
  - `/api/v1/admin/moderation/posts/:postId`: Chi tiết tin đăng
  - `/api/v1/admin/moderation/posts/:id/moderate`: Cập nhật trạng thái kiểm duyệt
  - `/api/v1/admin/moderation/stats`: Thống kê kiểm duyệt

### 2. Frontend (Next.js)

#### API Routes
- `/api/admin/moderation`: Danh sách tin đăng cần kiểm duyệt
- `/api/admin/moderation/[id]/get`: Chi tiết tin đăng
- `/api/admin/moderation/[id]`: Cập nhật trạng thái kiểm duyệt
- `/api/admin/moderation/stats`: Thống kê kiểm duyệt

#### Components
- `ModerationPanel.tsx`: Giao diện quản lý kiểm duyệt cơ bản
- `EnhancedModerationQueue.tsx`: Giao diện kiểm duyệt nâng cao với dữ liệu từ nhiều bảng
- `ModerationStats.tsx`: Biểu đồ và thống kê kiểm duyệt
- `EnhancedPostDetailModal.tsx`: Chi tiết tin đăng với dữ liệu từ posts, rooms và landlords

#### Pages
- `/admin/moderation`: Trang kiểm duyệt cơ bản
- `/admin/enhanced-moderation`: Trang kiểm duyệt nâng cao
- `/admin/moderation-stats`: Trang thống kê kiểm duyệt

## Quy trình kiểm duyệt

1. Người dùng đăng tin lên hệ thống
2. Tin đăng được đưa vào hàng đợi kiểm duyệt với trạng thái "pending"
3. Kiểm duyệt viên xem xét tin đăng và thông tin chi tiết
4. Kiểm duyệt viên đưa ra quyết định:
   - **Phê duyệt**: Tin đăng được hiển thị công khai
   - **Từ chối**: Tin đăng không được hiển thị, người dùng nhận thông báo lý do
5. Hệ thống ghi lại thông tin kiểm duyệt và cập nhật thống kê

## Dữ liệu từ nhiều bảng

Hệ thống kiểm duyệt tích hợp dữ liệu từ 3 bảng chính:

### 1. Bảng Posts (Tin đăng)
- ID tin đăng
- Trạng thái kiểm duyệt
- Thời gian đăng
- ID người đăng
- ID phòng
- Thông tin kiểm duyệt
- Lý do từ chối (nếu có)

### 2. Bảng Rooms (Phòng)
- Tiêu đề phòng
- Mô tả chi tiết
- Địa chỉ
- Giá thuê
- Diện tích
- Hình ảnh
- Tiện ích đi kèm

### 3. Bảng Users (Người dùng)
- Tên người đăng
- Email
- Số điện thoại
- Trạng thái xác thực
- Thời gian tham gia
- Lịch sử đăng tin

## Hướng dẫn sử dụng

### Truy cập hệ thống kiểm duyệt:
1. Đăng nhập vào tài khoản admin/moderator
2. Truy cập `/admin/moderation` hoặc `/admin/enhanced-moderation`

### Kiểm duyệt tin đăng:
1. Xem danh sách tin đăng cần duyệt
2. Nhấp vào "Xem" để xem chi tiết tin đăng
3. Kiểm tra các thông tin:
   - Nội dung tin đăng
   - Hình ảnh
   - Giá cả
   - Thông tin người đăng
4. Chọn "Duyệt" hoặc "Từ chối"
5. Nếu từ chối, nhập lý do và đánh dấu vấn đề cụ thể

### Xem thống kê:
1. Truy cập `/admin/moderation-stats`
2. Chọn khoảng thời gian cần xem
3. Khám phá các biểu đồ và số liệu thống kê

## Bảo mật

Hệ thống kiểm duyệt được bảo vệ bởi:
- Middleware xác thực (`authenticate.js`)
- Middleware phân quyền (`authorize.js` - yêu cầu quyền admin hoặc moderator)
- Kiểm tra quyền truy cập cho mỗi API endpoint

## Khắc phục sự cố

### Không tải được danh sách tin đăng:
- Kiểm tra quyền truy cập (phải là admin hoặc moderator)
- Kiểm tra kết nối đến backend API
- Xem logs để biết thêm chi tiết

### Không thể phê duyệt/từ chối tin đăng:
- Đảm bảo đã cung cấp lý do từ chối (nếu từ chối)
- Kiểm tra quyền truy cập
- Thử làm mới trang và thao tác lại

## Hỗ trợ và liên hệ

Nếu gặp vấn đề hoặc cần hỗ trợ về hệ thống kiểm duyệt, vui lòng liên hệ:
- Email: support@phongtro-modern.com
- Hotline: 0123456789