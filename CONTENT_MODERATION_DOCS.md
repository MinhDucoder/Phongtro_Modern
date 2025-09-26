# Tính năng Kiểm duyệt Nội dung

Tài liệu này mô tả chi tiết về tính năng kiểm duyệt nội dung bài đăng trong hệ thống Phongtro Modern.

## Mô tả chức năng

Tính năng kiểm duyệt nội dung cho phép quản trị viên xem xét và phê duyệt các bài đăng trước khi chúng xuất hiện công khai trên trang web. Quy trình này giúp đảm bảo nội dung chất lượng và tuân thủ các quy định của nền tảng.

## Luồng làm việc

1. Người dùng đăng tin cho thuê
2. Bài đăng được lưu vào hệ thống với trạng thái "pending" (chờ duyệt)
3. Quản trị viên xem xét nội dung bài đăng trong trang quản trị
4. Quản trị viên có thể:
   - Phê duyệt bài đăng: Bài đăng sẽ xuất hiện công khai
   - Từ chối bài đăng: Bài đăng sẽ không được hiển thị, người đăng sẽ nhận được lý do

## Giao diện người dùng

### Bảng kiểm duyệt
- **Thống kê**: Hiển thị số lượng bài đăng theo từng trạng thái
- **Bộ lọc**: Lọc theo trạng thái (tất cả, chờ duyệt, đã duyệt, từ chối)
- **Tìm kiếm**: Tìm bài đăng theo tiêu đề hoặc tác giả
- **Phân trang**: Hiển thị số trang và điều hướng

### Xem chi tiết bài đăng
- **Thông tin cơ bản**: Tiêu đề, giá, địa điểm, danh mục, người đăng
- **Nội dung**: Mô tả chi tiết
- **Hình ảnh**: Xem tất cả hình ảnh của bài đăng
- **Trạng thái**: Hiển thị trạng thái hiện tại của bài đăng

### Phê duyệt/Từ chối
- **Phê duyệt nhanh**: Nút phê duyệt trực tiếp từ danh sách
- **Từ chối**: Yêu cầu nhập lý do từ chối để người đăng có thể sửa lại

## API Endpoints

### GET `/api/admin/moderation`
Lấy danh sách bài đăng cần kiểm duyệt

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số lượng kết quả trên mỗi trang (default: 10)
- `status`: Lọc theo trạng thái (`all`, `pending`, `approved`, `rejected`)
- `search`: Tìm kiếm theo tiêu đề hoặc tác giả

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "1",
        "title": "PHÒNG TRỌ CHO THUÊ GẦN ĐẠI HỌC BÁCH KHOA",
        "author": "Nguyễn Văn A",
        "authorId": "user1",
        "status": "pending",
        "submittedAt": "2023-06-01T08:30:00.000Z",
        "category": "Phòng trọ",
        "location": "Hai Bà Trưng, Hà Nội",
        "price": "3.5 triệu/tháng",
        "description": "...",
        "images": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "limit": 10,
      "total": 48
    },
    "statistics": {
      "total": 48,
      "pending": 15,
      "approved": 25,
      "rejected": 8
    }
  }
}
```

### PATCH `/api/admin/moderation/[postId]`
Cập nhật trạng thái bài đăng

**Request Body:**
```json
{
  "status": "approved" | "rejected",
  "reason": "Lý do từ chối (bắt buộc khi status='rejected')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã duyệt bài đăng thành công",
  "data": {
    "post": {
      "id": "1",
      "status": "approved",
      "reason": null
    }
  }
}
```

## Xử lý lỗi và Tính khả dụng cao

### Mock Data
Hệ thống sử dụng mock data để đảm bảo giao diện người dùng vẫn hoạt động ngay cả khi API backend không khả dụng. Điều này giúp:

- Đảm bảo tính khả dụng cao của giao diện người dùng
- Cho phép thử nghiệm và phát triển dễ dàng hơn
- Xử lý các tình huống API bị gián đoạn hoặc lỗi

### Quản lý lỗi
Các lỗi được xử lý và hiển thị thân thiện đến người dùng thông qua:

- Thông báo toast cho các hành động thành công/thất bại
- Hiển thị thông tin lỗi cụ thể từ API
- Ghi log lỗi đầy đủ để gỡ lỗi và khắc phục

## Bảo mật

- API endpoint được bảo vệ bởi middleware xác thực
- Chỉ quản trị viên mới có quyền truy cập vào các API kiểm duyệt
- Mọi hành động đều được ghi log để theo dõi và kiểm tra

## Hướng phát triển tương lai

- Thêm tính năng lọc nâng cao (theo ngày, giá, khu vực)
- Thêm hệ thống thông báo cho người dùng khi bài đăng được duyệt/từ chối
- Tích hợp công cụ kiểm tra nội dung tự động bằng AI
- Thêm tính năng báo cáo vi phạm cho người dùng