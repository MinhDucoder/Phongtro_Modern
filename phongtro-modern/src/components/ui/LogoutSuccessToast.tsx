'use client';

import React from 'react';
import { toast, Toast } from 'react-hot-toast';

// Custom Toast component for logout success
export const showLogoutSuccessToast = () => {
  // Dismiss any existing toasts first
  toast.dismiss();
  
  toast.custom(
    (t: Toast) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-blue-600 shadow-lg rounded-lg pointer-events-auto flex items-center border-l-4 border-blue-400`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center p-4 w-full">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
              <span role="img" aria-label="logout" className="text-sm">👋</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              Đã đăng xuất thành công!
            </p>
            <p className="text-xs text-white/80 mt-1">
              Hẹn gặp lại bạn!
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
      duration: 2500, 
      position: 'top-right',
      id: 'logout-success' // Prevent duplicate toasts
    }
  );
};