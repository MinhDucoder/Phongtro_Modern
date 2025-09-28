'use client';

import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PropertyDetailErrorProps {
  error?: string;
  onRetry?: () => void;
}

export default function PropertyDetailError({ 
  error = 'Có lỗi xảy ra khi tải thông tin bất động sản', 
  onRetry 
}: PropertyDetailErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Không thể tải thông tin
        </h2>
        
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Thử lại
          </button>
        )}
        
        <div className="mt-6">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Quay về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
