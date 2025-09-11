'use client';

import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'search' | 'properties' | 'favorites' | 'posts' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type,
  title,
  description,
  actionText,
  actionHref,
  onAction
}: EmptyStateProps) {
  const getConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: <MagnifyingGlassIcon className="w-16 h-16 text-gray-400" />,
          title: title || 'Không tìm thấy kết quả',
          description: description || 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để có kết quả tốt hơn.',
          actionText: actionText || 'Xóa bộ lọc',
          actionHref: actionHref || '/',
          actionType: 'link' as const
        };
      
      case 'properties':
        return {
          icon: <HomeIcon className="w-16 h-16 text-gray-400" />,
          title: title || 'Chưa có tin đăng nào',
          description: description || 'Hãy đăng tin cho thuê để bắt đầu kết nối với khách hàng.',
          actionText: actionText || 'Đăng tin ngay',
          actionHref: actionHref || '/dang-tin',
          actionType: 'link' as const
        };
      
      case 'favorites':
        return {
          icon: <HomeIcon className="w-16 h-16 text-gray-400" />,
          title: title || 'Chưa có tin yêu thích',
          description: description || 'Hãy lưu những tin đăng bạn quan tâm để xem lại sau.',
          actionText: actionText || 'Tìm kiếm phòng trọ',
          actionHref: actionHref || '/phong-tro',
          actionType: 'link' as const
        };
      
      case 'posts':
        return {
          icon: <PlusIcon className="w-16 h-16 text-gray-400" />,
          title: title || 'Chưa có tin đăng nào',
          description: description || 'Bắt đầu đăng tin cho thuê để tìm kiếm khách hàng.',
          actionText: actionText || 'Đăng tin mới',
          actionHref: actionHref || '/dang-tin',
          actionType: 'link' as const
        };
      
      case 'error':
        return {
          icon: <ExclamationTriangleIcon className="w-16 h-16 text-red-400" />,
          title: title || 'Đã xảy ra lỗi',
          description: description || 'Có vẻ như đã xảy ra sự cố. Vui lòng thử lại sau.',
          actionText: actionText || 'Thử lại',
          actionType: 'button' as const
        };
      
      default:
        return {
          icon: <HomeIcon className="w-16 h-16 text-gray-400" />,
          title: title || 'Không có dữ liệu',
          description: description || 'Hiện tại chưa có dữ liệu để hiển thị.',
          actionText: actionText || 'Quay lại',
          actionHref: actionHref || '/',
          actionType: 'link' as const
        };
    }
  };

  const config = getConfig();

  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        {config.icon}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {config.title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {config.description}
      </p>
      
      {config.actionText && (
        <div>
          {config.actionType === 'link' && config.actionHref ? (
            <Link
              href={config.actionHref}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {config.actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {config.actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
