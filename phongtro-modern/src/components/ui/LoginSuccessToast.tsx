'use client';

import React from 'react';
import { toast, Toast } from 'react-hot-toast';
import { User } from '@/lib/api';

// Custom Toast component for login success with user role awareness
export const showLoginSuccessToast = (user?: User | null) => {
  // Determine if this is an admin account
  const isAdmin = user?.role === 'admin';
  
  toast.custom(
    (t: Toast) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-fit w-auto ${isAdmin ? 'bg-purple-600' : 'bg-green-500'} shadow-md rounded-md pointer-events-auto flex items-center`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center p-2 min-w-[160px]">
          <div className="flex-shrink-0">
            <span role="img" aria-label="wave" className="text-base mr-2">👋</span>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs font-medium text-white whitespace-nowrap">
              {isAdmin 
                ? 'Đăng nhập admin thành công!' 
                : 'Đăng nhập thành công!'}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-1 flex items-center justify-center text-white hover:text-gray-200 focus:outline-none"
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    ),
    { duration: 2000, position: 'top-right' }
  );
};