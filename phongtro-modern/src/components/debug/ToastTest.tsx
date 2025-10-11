'use client';

import { toastManager } from '@/components/ui/ToastManager';

export default function ToastTest() {
  const testSuccessToast = () => {
    toastManager.showSuccess('Gửi yêu cầu thuê thành công!');
  };

  const testErrorToast = () => {
    toastManager.showError('Bạn đã có yêu cầu thuê đang chờ xử lý cho phòng này');
  };

  const testNetworkErrorToast = () => {
    toastManager.showError('Không thể kết nối đến server');
  };

  const testNotFoundErrorToast = () => {
    toastManager.showError('Không tìm thấy thông tin phòng trọ');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test Toast Notifications</h2>
      <div className="space-y-3">
        <button
          onClick={testSuccessToast}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Test Success Toast
        </button>
        
        <button
          onClick={testErrorToast}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Test Duplicate Request Error
        </button>
        
        <button
          onClick={testNetworkErrorToast}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Test Network Error
        </button>
        
        <button
          onClick={testNotFoundErrorToast}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Test Not Found Error
        </button>
      </div>
    </div>
  );
}
