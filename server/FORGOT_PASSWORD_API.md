# API Quên Mật Khẩu - PhongTroVN

## Tổng quan
Chức năng quên mật khẩu cho phép người dùng đặt lại mật khẩu của họ thông qua email xác thực.

## Flow quên mật khẩu

1. **Yêu cầu đặt lại mật khẩu** → Gửi email với link reset
2. **Xác thực token** → Kiểm tra link có hợp lệ không
3. **Đặt lại mật khẩu** → Cập nhật mật khẩu mới

## Endpoints

### 1. Yêu cầu đặt lại mật khẩu
```
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư."
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Vui lòng nhập email"
}
```

### 2. Xác thực token reset password
```
GET /api/v1/auth/verify-reset-token?token={token}
```

**Query Parameters:**
- `token`: Token được gửi qua email

**Response Success (200):**
```json
{
  "success": true,
  "message": "Token hợp lệ",
  "email": "user@example.com"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 3. Đặt lại mật khẩu
```
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới."
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

## Validation Rules

### Forgot Password
- `email`: Required, phải là email hợp lệ

### Reset Password
- `token`: Required, string
- `newPassword`: Required, minimum 6 characters

## Security Features

1. **Token Expiration**: Token reset password hết hạn sau 1 giờ
2. **Single Use**: Token chỉ sử dụng được 1 lần
3. **Email Privacy**: Không tiết lộ email có tồn tại hay không
4. **Password Hashing**: Mật khẩu mới được hash trước khi lưu

## Frontend Integration

### 1. Trang quên mật khẩu
```javascript
const handleForgotPassword = async (email) => {
  try {
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Email reset password đã được gửi!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 2. Trang reset password
```javascript
const handleResetPassword = async (token, newPassword) => {
  try {
    const response = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Đặt lại mật khẩu thành công!');
      // Redirect to login page
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Email Template

Email reset password sẽ có:
- Link reset với token: `${FRONTEND_URL}/dang-nhap/reset-password?token=${token}`
- Thời hạn: 1 giờ
- Hướng dẫn chi tiết

## Database Changes

Đã thêm vào User Schema:
```javascript
password_reset_token: { type: String },
password_reset_expires: { type: Date }
```

## Environment Variables

Đảm bảo có các biến sau trong `.env`:
```
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:3000
```

## Testing

Có thể test bằng Postman hoặc cURL:

```bash
# 1. Request reset password
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify token
curl -X GET "http://localhost:5000/api/v1/auth/verify-reset-token?token=your_token"

# 3. Reset password
curl -X POST http://localhost:5000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token", "newPassword": "newPassword123"}'
```