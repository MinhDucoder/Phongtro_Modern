'use client';

import React from 'react';
import Link from 'next/link';

interface PostLimitExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
  usedPosts?: number;
  postLimit?: number;
}

const PostLimitExceededModal: React.FC<PostLimitExceededModalProps> = ({
  isOpen,
  onClose,
  packageName = "Miễn phí",
  usedPosts = 0,
  postLimit = 3
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        {/* Icon cảnh báo */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Đã hết lượt đăng tin!
        </h2>

        {/* Nội dung */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-3">
            Bạn đã sử dụng hết <span className="font-semibold text-red-600">{usedPosts}/{postLimit}</span> lượt đăng tin của gói <span className="font-semibold">{packageName}</span>.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">
              💡 <strong>Để tiếp tục đăng tin, bạn cần:</strong>
            </p>
            <ul className="text-sm text-red-600 mt-2 space-y-1">
              <li>• Nâng cấp lên gói cao hơn</li>
              <li>• Hoặc gia hạn gói hiện tại</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Chọn gói phù hợp để có thêm lượt đăng tin và tính năng nâng cao.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Để sau
          </button>
          <Link
            href="/thanh-toan"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-center"
            onClick={onClose}
          >
            Nâng cấp ngay
          </Link>
        </div>

        {/* Đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostLimitExceededModal;