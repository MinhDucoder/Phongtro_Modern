'use client';

import React from 'react';
import { toast, Toast } from 'react-hot-toast';

// Custom Toast component for login success
export const showLoginSuccessToast = () => {
  toast.custom(
    (t: Toast) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-xs w-auto bg-green-500 shadow-lg rounded-lg pointer-events-auto flex`}
      >
        <div className="flex-1 w-0 p-2.5">
          <div className="flex items-center">
            <div className="flex-shrink-0 pt-0.5">
              <span role="img" aria-label="wave" className="text-lg">👋</span>
            </div>
            <div className="ml-2 flex-1">
              <p className="text-xs font-medium text-white">
                Đăng nhập thành công!
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-green-400">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-2.5 flex items-center justify-center text-xs font-medium text-white hover:text-white focus:outline-none"
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    ),
    { duration: 2000, position: 'top-right' }
  );
};