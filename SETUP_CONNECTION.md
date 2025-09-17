# Hướng dẫn kết nối Frontend với Backend

## Tổng quan
Project này đã được cấu hình để kết nối frontend (Next.js) với backend (Node.js/Express) thông qua API REST.

## Cấu trúc kết nối

### Frontend (Next.js)
- **Port**: 3000
- **API Service**: `src/lib/api.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Connection Status**: Hiển thị trạng thái kết nối real-time

### Backend (Node.js/Express)
- **Port**: 5000
- **API Base URL**: `http://localhost:5000/api/v1`
- **CORS**: Đã cấu hình để cho phép frontend kết nối

## Các tính năng đã implement

### 1. API Service Layer (`src/lib/api.ts`)
- Generic API request function
- Auth API (login, register, logout, verify email)
- Room API (CRUD operations)
- TypeScript interfaces cho type safety

### 2. Authentication Context (`src/contexts/AuthContext.tsx`)
- Quản lý authentication state
- Login/Register functions
- Auto token management
- Loading states

### 3. Updated AuthForm Component
- Tích hợp với AuthContext
- Real API calls thay vì mock
- Error handling và validation

### 4. Connection Status Component
- Real-time backend health check
- Visual indicator ở góc màn hình
- Auto retry every 30 seconds

## Cách chạy project

### 1. Backend
```bash
cd server
npm install
npm run dev
```
Backend sẽ chạy tại: `http://localhost:5000`

### 2. Frontend
```bash
cd phongtro-modern
npm install
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:3000`

## Environment Variables

Tạo file `.env.local` trong thư mục `phongtro-modern`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=NhaTroVN
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký user mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/logout` - Đăng xuất
- `GET /api/v1/auth/verify-email/:token` - Xác thực email

### Rooms
- `GET /api/v1/rooms` - Lấy danh sách phòng
- `GET /api/v1/rooms/:id` - Lấy thông tin phòng
- `POST /api/v1/rooms` - Tạo phòng mới
- `PUT /api/v1/rooms/:id` - Cập nhật phòng
- `DELETE /api/v1/rooms/:id` - Xóa phòng

## Cách sử dụng

### 1. Đăng ký tài khoản
- Truy cập `/dang-ky`
- Điền thông tin và chọn vai trò (người thuê/chủ nhà)
- API sẽ tạo tài khoản mới

### 2. Đăng nhập
- Truy cập `/dang-nhap`
- Nhập email và password
- Token sẽ được lưu trong cookies và localStorage

### 3. Kiểm tra kết nối
- Góc dưới bên phải sẽ hiển thị trạng thái kết nối
- Xanh: Kết nối OK
- Đỏ: Mất kết nối

## Troubleshooting

### Lỗi CORS
- Kiểm tra backend có chạy trên port 5000
- Kiểm tra CORS config trong `server/src/server.js`

### Lỗi kết nối
- Kiểm tra cả frontend và backend đều đang chạy
- Kiểm tra firewall/antivirus có block port không
- Kiểm tra environment variables

### Lỗi authentication
- Kiểm tra JWT_SECRET trong backend .env
- Kiểm tra token có được lưu đúng không
- Kiểm tra cookies có được gửi kèm request không

## Mở rộng

### Thêm API endpoint mới
1. Thêm function trong `src/lib/api.ts`
2. Thêm TypeScript interface nếu cần
3. Sử dụng trong component

### Thêm protected routes
1. Tạo middleware để check authentication
2. Wrap component với auth check
3. Redirect nếu chưa đăng nhập

### Thêm real-time features
1. Cài đặt Socket.io
2. Tạo socket context
3. Implement real-time updates
