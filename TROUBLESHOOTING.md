# Troubleshooting Guide - API Connection Issues

## Lỗi "Failed to fetch" khi kết nối API

### Nguyên nhân thường gặp:

1. **Backend server không chạy**
   - Kiểm tra: `http://localhost:5000` có phản hồi không
   - Chạy backend: `cd server && npm run dev`

2. **Browser extension chặn request**
   - Tắt các extension như AdBlock, Privacy Badger
   - Thử chạy trong incognito mode

3. **CORS issues**
   - Backend đã cấu hình CORS cho localhost:3000
   - Kiểm tra console browser có lỗi CORS không

4. **Firewall/Network issues**
   - Kiểm tra Windows Firewall
   - Thử tắt antivirus tạm thời

### Cách debug:

1. **Sử dụng trang debug:**
   ```
   http://localhost:3000/debug
   ```

2. **Kiểm tra console browser:**
   - Mở Developer Tools (F12)
   - Xem tab Console và Network

3. **Test trực tiếp backend:**
   ```bash
   curl http://localhost:5000/api/v1/user/me
   ```

4. **Kiểm tra processes:**
   ```bash
   netstat -ano | findstr :5000
   netstat -ano | findstr :3000
   ```

### Giải pháp:

1. **Restart cả frontend và backend:**
   ```bash
   # Chạy file batch
   restart-dev.bat
   ```

2. **Hoặc restart thủ công:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend  
   cd phongtro-modern
   npm run dev
   ```

3. **Clear browser cache:**
   - Ctrl + Shift + R (hard refresh)
   - Clear browser cache

4. **Thử browser khác:**
   - Chrome, Firefox, Edge

### Logs để kiểm tra:

- **Backend logs:** Terminal chạy `npm run dev` trong thư mục `server`
- **Frontend logs:** Browser console (F12)
- **Network logs:** Browser Developer Tools > Network tab

### API Endpoints test:

- `GET /api/v1/user/me` - Lấy thông tin user (cần auth)
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /` - Health check backend

### Environment Variables:

Tạo file `.env.local` trong thư mục `phongtro-modern`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NODE_ENV=development
```

### Nếu vẫn không được:

1. Kiểm tra port conflicts
2. Thử đổi port backend (5001, 5002...)
3. Kiểm tra proxy settings
4. Thử chạy trên localhost thay vì 127.0.0.1

