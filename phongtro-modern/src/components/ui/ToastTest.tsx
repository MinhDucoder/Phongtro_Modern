'use client';

import React from 'react';
import { toastManager } from './ToastManager';

export default function ToastTest() {
  const testLoginSuccess = () => {
    toastManager.showLoginSuccess('Nguyễn Văn A', false);
  };

  const testAdminLoginSuccess = () => {
    toastManager.showLoginSuccess('Admin User', true);
  };

  const testLogoutSuccess = () => {
    toastManager.showLogoutSuccess();
  };

  const testLoginError = () => {
    toastManager.showLoginError('Email hoặc mật khẩu không chính xác');
  };

  const testSuccess = () => {
    toastManager.showSuccess('Thao tác thành công!');
  };

  const testError = () => {
    toastManager.showError('Có lỗi xảy ra!');
  };

  const testWarning = () => {
    toastManager.showWarning('Cảnh báo: Dữ liệu có thể bị mất!');
  };

  const testInfo = () => {
    toastManager.showInfo('Thông tin: Hệ thống đang bảo trì');
  };

  const clearAll = () => {
    toastManager.clearAll();
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Toast Test Panel</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={testLoginSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Login Success
        </button>
        
        <button
          onClick={testAdminLoginSuccess}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Admin Login
        </button>
        
        <button
          onClick={testLogoutSuccess}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Logout Success
        </button>
        
        <button
          onClick={testLoginError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Login Error
        </button>
        
        <button
          onClick={testSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Success
        </button>
        
        <button
          onClick={testError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Error
        </button>
        
        <button
          onClick={testWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Warning
        </button>
        
        <button
          onClick={testInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Info
        </button>
      </div>
      
      <div className="mt-8">
        <button
          onClick={clearAll}
          className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Clear All Toasts
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Toast Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Auto-dismiss after duration</li>
          <li>✅ Smooth animations (enter/leave)</li>
          <li>✅ Hover effects</li>
          <li>✅ Icon animations</li>
          <li>✅ Professional styling</li>
          <li>✅ Responsive design</li>
          <li>✅ Accessibility support</li>
          <li>✅ No duplicate toasts</li>
          <li>✅ Manual dismiss option</li>
          <li>✅ Role-based styling (Admin vs User)</li>
        </ul>
      </div>
    </div>
  );
}


