'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Component để thiết lập cấu hình toast toàn cục
export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Cấu hình mặc định cho tất cả toast
        duration: 3000,
        style: {
          borderRadius: '4px',
          padding: '10px 16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '400px',
          background: '#333',
          color: 'white',
        },
        // Cấu hình riêng cho từng loại toast
        success: {
          style: {
            background: '#10b981',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#ef4444',
          },
        },
        loading: {
          style: {
            background: '#3b82f6',
            color: 'white',
          },
        },
      }}
    />
  );
}

// Hàm tiện ích để hiển thị các toast tùy chỉnh
export const customToast = {
  success: (message: string, icon: string = '✓') => {
    // Dismiss any existing toasts first
    toast.dismiss();
    const id = 'success-toast';
    const duration = 3000;
    
    toast.success(message, {
      icon,
      duration,
      style: {
        background: '#10b981',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #059669',
      },
      position: 'top-right',
      id,
    });
    setTimeout(() => toast.dismiss(id), duration + 100);
  },
  
  error: (message: string, icon: string = '✕') => {
    // Dismiss any existing toasts first
    toast.dismiss();
    const id = 'error-toast';
    const duration = 4000;
    
    toast.error(message, {
      icon,
      duration,
      style: {
        background: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dc2626',
      },
      position: 'top-right',
      id,
      // Tắt icon mặc định của react-hot-toast
      iconTheme: {
        primary: 'white',
        secondary: '#ef4444'
      }
    });
    setTimeout(() => toast.dismiss(id), duration + 100);
  },

  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: 'white',
        borderRadius: '4px',
        padding: '10px 16px',
      },
      position: 'top-right',
      duration: 3000,
    });
  },

  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: 'white',
        borderRadius: '4px',
        padding: '10px 16px',
      },
      position: 'top-right',
      duration: 3000,
    });
  },
  
  custom: (message: string, options: any) => {
    toast(message, {
      ...options,
      position: 'top-right',
    });
  },
  
  // Toast cho lỗi đăng nhập
  loginError: (message: string) => {
    // Dismiss any existing toasts first
    toast.dismiss();
    const id = 'login-error';
    const duration = 4000;
    
    toast.error(message, {
      icon: '🔐',
      duration,
      style: {
        background: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dc2626',
      },
      position: 'top-right',
      id, // Prevent duplicate toasts
      // Tắt icon mặc định của react-hot-toast
      iconTheme: {
        primary: 'white',
        secondary: '#ef4444'
      }
    });
    setTimeout(() => toast.dismiss(id), duration + 100);
  },
  
  // Toast cho việc xác thực email
  verificationNeeded: (message: string) => {
    toast(message, {
      icon: '✉️',
      duration: 3000,
      style: {
        background: '#f59e0b',
        color: 'white',
        borderRadius: '4px',
        padding: '10px 16px',
        fontSize: '14px',
      },
      position: 'top-right',
    });
  }
};