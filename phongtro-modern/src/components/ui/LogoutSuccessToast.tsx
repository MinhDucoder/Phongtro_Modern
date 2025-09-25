'use client';

import React from 'react';
import { toast, Toast } from 'react-hot-toast';

// Custom Toast component for logout success
export const showLogoutSuccessToast = () => {
  toast.custom(
    (t: Toast) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-700 shadow-lg rounded-lg pointer-events-auto flex`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 pt-0.5">
              <span role="img" aria-label="wave" className="text-2xl">👋</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                Đã đăng xuất thành công!
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-600">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-white focus:outline-none"
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    ),
    { duration: 2000, position: 'top-right' }
  );
};