# ToastManager - Professional Toast Notifications

## Overview
ToastManager là một singleton class được thiết kế để quản lý toast notifications một cách chuyên nghiệp, tránh bị đứng và cung cấp trải nghiệm người dùng tốt nhất.

## Features

### ✅ **Chuyên nghiệp**
- **Auto-dismiss**: Tự động ẩn sau thời gian quy định
- **Smooth animations**: Hiệu ứng mượt mà khi xuất hiện/ẩn
- **Hover effects**: Hiệu ứng khi hover
- **Icon animations**: Animation cho icons
- **Professional styling**: Thiết kế chuyên nghiệp
- **Responsive design**: Tương thích mọi thiết bị
- **Accessibility support**: Hỗ trợ screen readers
- **No duplicate toasts**: Tránh duplicate notifications
- **Manual dismiss**: Có thể đóng thủ công
- **Role-based styling**: Khác biệt cho Admin vs User

### ✅ **Tránh bị đứng**
- **Clear existing toasts**: Tự động xóa toasts cũ trước khi hiển thị mới
- **Unique IDs**: Mỗi toast có ID duy nhất
- **Proper cleanup**: Dọn dẹp memory leaks
- **Timeout management**: Quản lý timeout đúng cách

## Usage

### Import
```typescript
import { toastManager } from '@/components/ui/ToastManager';
```

### Login Success
```typescript
// User login
toastManager.showLoginSuccess('Nguyễn Văn A', false);

// Admin login
toastManager.showLoginSuccess('Admin User', true);
```

### Logout Success
```typescript
toastManager.showLogoutSuccess();
```

### Login Error
```typescript
toastManager.showLoginError('Email hoặc mật khẩu không chính xác');
```

### General Notifications
```typescript
// Success
toastManager.showSuccess('Thao tác thành công!');

// Error
toastManager.showError('Có lỗi xảy ra!');

// Warning
toastManager.showWarning('Cảnh báo: Dữ liệu có thể bị mất!');

// Info
toastManager.showInfo('Thông tin: Hệ thống đang bảo trì');
```

### Clear All Toasts
```typescript
toastManager.clearAll();
```

## Integration with AuthContext

ToastManager đã được tích hợp vào `AuthContext.tsx`:

```typescript
// Login success
toastManager.showLoginSuccess(response.user.full_name, response.user.role === 'admin');

// Login error
toastManager.showLoginError(errorMessage);

// Logout success
toastManager.showLogoutSuccess();

// Registration success
toastManager.showSuccess(response.message || 'Đăng ký thành công!');

// Registration error
toastManager.showError(errorMessage);
```

## Styling

### CSS Classes
- `.animate-enter`: Animation khi xuất hiện
- `.animate-leave`: Animation khi ẩn
- `.toast-hover`: Hiệu ứng hover
- `.toast-icon`: Animation cho icon
- `.toast-icon-success`: Animation cho success icon
- `.toast-icon-error`: Animation cho error icon

### Colors
- **Success**: Green (`#10b981`)
- **Error**: Red (`#ef4444`)
- **Warning**: Yellow (`#f59e0b`)
- **Info**: Blue (`#3b82f6`)
- **Login Success**: Green (`#10b981`) / Purple for Admin (`#7c3aed`)
- **Logout Success**: Blue (`#3b82f6`)

## Testing

Để test toast notifications, truy cập:
```
http://localhost:3000/test-toast
```

## Best Practices

1. **Always clear existing toasts** before showing new ones
2. **Use appropriate toast types** for different scenarios
3. **Keep messages concise** and user-friendly
4. **Test on different screen sizes** for responsive design
5. **Use role-based styling** for different user types
6. **Handle errors gracefully** with proper error messages

## Troubleshooting

### Toast bị đứng
- ✅ **Fixed**: ToastManager tự động clear existing toasts
- ✅ **Fixed**: Sử dụng unique IDs để tránh duplicate
- ✅ **Fixed**: Proper cleanup trong onDismiss

### Toast không hiển thị
- Kiểm tra import ToastManager
- Kiểm tra CSS animations được import
- Kiểm tra z-index và positioning

### Performance issues
- ToastManager sử dụng singleton pattern
- Tự động cleanup memory leaks
- Optimized animations với CSS transforms

## Migration from old toast system

### Before (Old)
```typescript
import { showLoginSuccessToast } from '@/components/ui/LoginSuccessToast';
import { customToast } from '@/components/ui/CustomToast';

showLoginSuccessToast(user);
customToast.loginError(message);
```

### After (New)
```typescript
import { toastManager } from '@/components/ui/ToastManager';

toastManager.showLoginSuccess(user.full_name, user.role === 'admin');
toastManager.showLoginError(message);
```

## Future Enhancements

- [ ] Toast queuing system
- [ ] Custom toast positions
- [ ] Toast themes
- [ ] Sound notifications
- [ ] Toast history
- [ ] Batch operations

