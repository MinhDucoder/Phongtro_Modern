'use client';

import React from 'react';
import { toastManager } from '@/components/ui/ToastManager';
import { User } from '@/lib/api';

// Custom Toast component for login success with user role awareness
export const showLoginSuccessToast = (user?: User | null) => {
  // Determine if this is an admin account
  const isAdmin = user?.role === 'admin';
  const userName = user?.full_name || 'Người dùng';
  
  // Dismiss any existing toasts first
  toastManager.showSuccess(
    isAdmin ? 'Chào mừng Admin!' : `Chào mừng ${userName}!`,
    {
      icon: '✓',
      description: isAdmin ? 'Đăng nhập admin thành công' : 'Đăng nhập thành công',
      duration: 3000,
    }
  );
};