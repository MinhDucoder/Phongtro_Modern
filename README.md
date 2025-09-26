"# Phongtro_Modern

Hệ thống quản lý và đăng tin cho thuê phòng trọ, nhà nguyên căn, căn hộ...

## Tính năng chính

### Dành cho người dùng
- Đăng tin cho thuê phòng trọ, nhà nguyên căn, căn hộ
- Tìm kiếm phòng trọ theo nhiều tiêu chí
- Chat với chủ trọ
- Đặt lịch hẹn xem phòng
- Thanh toán trực tuyến
- Quản lý tin đăng, lịch hẹn, hợp đồng

### Dành cho quản trị viên
- Quản lý người dùng
- Kiểm duyệt nội dung bài đăng
- Thống kê báo cáo
- Dashboard quản lý hệ thống

## Công nghệ sử dụng

- **Frontend**: Next.js 13+, React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, Passport
- **Cloud Storage**: Cloudinary
- **Realtime Chat**: Socket.io
- **Payment**: VNPay

## Tài liệu kỹ thuật

### Cài đặt và chạy dự án

#### Yêu cầu môi trường
- Node.js 16+
- MongoDB 5+

#### Frontend (Next.js)
```bash
cd phongtro-modern
npm install
npm run dev
```

#### Backend (Express)
```bash
cd server
npm install
npm run dev
```

### Tính năng kiểm duyệt nội dung

Hệ thống kiểm duyệt nội dung cho phép quản trị viên:

1. **Xem danh sách bài đăng cần kiểm duyệt**: Hiển thị tất cả bài đăng đang chờ, đã duyệt hoặc từ chối
2. **Phê duyệt hoặc từ chối bài đăng**: Quản trị viên có thể phê duyệt hoặc từ chối bài đăng với lý do cụ thể
3. **Xem chi tiết bài đăng**: Xem đầy đủ nội dung, hình ảnh và thông tin liên quan trước khi kiểm duyệt
4. **Thống kê bài đăng**: Hiển thị số lượng bài đăng theo từng trạng thái

#### Cấu trúc API kiểm duyệt

- `GET /api/admin/moderation`: Lấy danh sách bài đăng cần kiểm duyệt
- `PATCH /api/admin/moderation/[postId]`: Cập nhật trạng thái bài đăng (duyệt/từ chối)

#### Xử lý lỗi

Hệ thống sử dụng dữ liệu mẫu (mock data) khi API backend không khả dụng, giúp giao diện người dùng vẫn hoạt động trong mọi tình huống." 
