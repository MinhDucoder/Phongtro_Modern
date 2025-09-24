# Frontend - Chức năng Quên Mật Khẩu

## Tổng quan
Đã tạo hoàn chỉnh frontend cho chức năng quên mật khẩu với 2 trang chính và các API routes tương ứng.

## 📁 Cấu trúc Files

### Pages (Next.js App Router)
```
src/app/
├── quen-mat-khau/
│   └── page.tsx                    # Trang yêu cầu reset password
├── dang-nhap/
│   ├── page.tsx                    # Trang đăng nhập (đã cập nhật link)
│   └── reset-password/
│       └── page.tsx                # Trang đặt lại mật khẩu
```

### Components
```
src/components/auth/
├── AuthForm.tsx                    # Form đăng nhập/đăng ký (đã cập nhật)
├── ForgotPasswordForm.tsx          # Form quên mật khẩu
└── ResetPasswordForm.tsx           # Form đặt lại mật khẩu
```

### API Routes (Frontend Proxy)
```
src/app/api/auth/
├── forgot-password/
│   └── route.ts                    # POST /api/auth/forgot-password
├── verify-reset-token/
│   └── route.ts                    # GET /api/auth/verify-reset-token
└── reset-password/
    └── route.ts                    # POST /api/auth/reset-password
```

## 🚀 Flow Người Dùng

### 1. Trang Đăng Nhập
- URL: `/dang-nhap`
- Có link "Quên mật khẩu?" dẫn đến `/quen-mat-khau`

### 2. Trang Quên Mật Khẩu
- URL: `/quen-mat-khau`
- Form nhập email
- Gửi request đến `/api/auth/forgot-password`
- Hiển thị thông báo thành công và hướng dẫn check email

### 3. Email được gửi
- Chứa link: `{FRONTEND_URL}/dang-nhap/reset-password?token={token}`
- Link có hiệu lực 1 giờ

### 4. Trang Đặt Lại Mật Khẩu
- URL: `/dang-nhap/reset-password?token={token}`
- Tự động xác minh token khi load trang
- Form nhập mật khẩu mới và xác nhận
- Redirect về trang đăng nhập sau khi thành công

## 🔧 Environment Variables

Cần thêm vào `.env.local` (frontend):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎨 UI/UX Features

### ForgotPasswordForm
- ✅ Validation email realtime
- ✅ Loading state khi gửi request
- ✅ Success state với hướng dẫn chi tiết
- ✅ Nút "Gửi lại email" và "Quay lại đăng nhập"

### ResetPasswordForm
- ✅ Tự động verify token khi load
- ✅ Loading state khi verify
- ✅ Hiển thị email đang reset
- ✅ Show/hide password
- ✅ Validation mật khẩu và confirm password
- ✅ Error handling cho token không hợp lệ

## 📱 Responsive Design
- Tương thích mobile và desktop
- Sử dụng Tailwind CSS
- Consistent với design system hiện tại

## 🛠️ Development

### Chạy Frontend
```bash
cd phongtro-modern
npm run dev
```

### Test Flow
1. Mở `http://localhost:3000/dang-nhap`
2. Click "Quên mật khẩu?"
3. Nhập email và gửi
4. Check email và click link
5. Nhập mật khẩu mới
6. Redirect về trang đăng nhập

## 🔐 Security Features

### Frontend Security
- Input validation trước khi gửi request
- Error handling không expose sensitive info
- Auto-redirect khi token invalid
- HTTPS ready (production)

### API Proxy Benefits
- Hide backend URL từ client
- Có thể thêm rate limiting
- Có thể cache response
- Easier monitoring

## 📋 Testing Checklist

### Functional Testing
- [ ] Gửi email với địa chỉ hợp lệ
- [ ] Validation email không hợp lệ
- [ ] Click link trong email
- [ ] Token verification
- [ ] Password validation
- [ ] Confirm password matching
- [ ] Submit reset password
- [ ] Redirect after success

### Error Handling
- [ ] Token expired
- [ ] Token không tồn tại
- [ ] Network errors
- [ ] Server down
- [ ] Invalid responses

### UI/UX Testing
- [ ] Loading states
- [ ] Error messages
- [ ] Success messages
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation)

## 🚦 Production Checklist

Before deployment:
- [ ] Update `NEXT_PUBLIC_API_URL` for production
- [ ] Test email delivery
- [ ] Test on production domain
- [ ] Check HTTPS redirects
- [ ] Monitor error logs

## 🔄 Integration với Backend

Frontend sẽ gọi:
1. `POST /api/auth/forgot-password` → Backend `/api/v1/auth/forgot-password`
2. `GET /api/auth/verify-reset-token` → Backend `/api/v1/auth/verify-reset-token`
3. `POST /api/auth/reset-password` → Backend `/api/v1/auth/reset-password`

Đảm bảo backend server đang chạy trên port 5000.

## 📞 Support

Nếu có vấn đề:
1. Check console errors (F12)
2. Check network tab
3. Verify backend server running
4. Check environment variables