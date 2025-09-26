'use client';

import React from 'react';
import { toast, Toast } from 'react-hot-toast';
import { User } from '@/lib/api';

// Custom Toast component for login success with user role awareness
export const showLoginSuccessToast = (user?: User | null) => {
  // Determine if this is an admin account
  const isAdmin = user?.role === 'admin';
  const userName = user?.full_name || 'Người dùng';
  
  // Dismiss any existing toasts first
  toast.dismiss();
  
  toast.custom(
    (t: Toast) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full ${isAdmin ? 'bg-purple-600' : 'bg-green-500'} shadow-lg rounded-lg pointer-events-auto flex items-center border-l-4 ${isAdmin ? 'border-purple-400' : 'border-green-400'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center p-4 w-full">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-purple-500' : 'bg-green-400'}`}>
              <span role="img" aria-label="success" className="text-sm">✓</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              {isAdmin ? 'Chào mừng Admin!' : `Chào mừng ${userName}!`}
            </p>
            <p className="text-xs text-white/80 mt-1">
              {isAdmin ? 'Đăng nhập admin thành công' : 'Đăng nhập thành công'}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-2 flex items-center justify-center text-white/70 hover:text-white focus:outline-none transition-colors"
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    ),
    { 
      duration: 3000, 
      position: 'top-right',
      id: 'login-success' // Prevent duplicate toasts
    }
  );
};