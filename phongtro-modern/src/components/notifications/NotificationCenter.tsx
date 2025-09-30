'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BellIcon,
  EyeIcon,
  HeartIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { toastManager } from '@/components/ui/ToastManager';

interface Notification {
  id: string;
  type: 'view' | 'like' | 'call' | 'message' | 'post_approved' | 'post_rejected' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  relatedProperty?: {
    id: string;
    title: string;
    image: string;
  };
  relatedUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  priority: 'low' | 'medium' | 'high';
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Tin nhắn mới từ Chị Hoa',
    message: 'Phòng còn trống không ạ?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    actionUrl: '/chat/1',
    relatedProperty: {
      id: '1',
      title: 'Phòng trọ gần ĐH Bách Khoa',
      image: '/placeholder-room.svg',
    },
    relatedUser: {
      id: '2',
      name: 'Chị Hoa',
      avatar: '/placeholder-room.svg',
    },
    priority: 'high',
  },
  {
    id: '2',
    type: 'call',
    title: 'Cuộc gọi bỏ lỡ',
    message: 'Có cuộc gọi từ 098****567 về tin "Căn hộ mini có ban công"',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
    actionUrl: '/phong-tro/2',
    relatedProperty: {
      id: '2',
      title: 'Căn hộ mini có ban công',
      image: '/placeholder-room.svg',
    },
    priority: 'high',
  },
  {
    id: '3',
    type: 'like',
    title: 'Tin đăng được yêu thích',
    message: '3 người đã thêm tin "Phòng trọ full nội thất" vào yêu thích',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
    actionUrl: '/phong-tro/3',
    relatedProperty: {
      id: '3',
      title: 'Phòng trọ full nội thất',
      image: '/placeholder-room.svg',
    },
    priority: 'medium',
  },
  {
    id: '4',
    type: 'post_approved',
    title: 'Tin đăng đã được duyệt',
    message: 'Tin "Nhà nguyên căn 2PN" đã được duyệt và hiển thị công khai',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    actionUrl: '/phong-tro/4',
    relatedProperty: {
      id: '4',
      title: 'Nhà nguyên căn 2PN',
      image: '/placeholder-room.svg',
    },
    priority: 'medium',
  },
  {
    id: '5',
    type: 'view',
    title: 'Lượt xem tăng cao',
    message: 'Tin đăng của bạn đã có 50+ lượt xem trong 24h qua',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: true,
    actionUrl: '/dashboard/tin-dang',
    priority: 'low',
  },
  {
    id: '6',
    type: 'payment',
    title: 'Thanh toán thành công',
    message: 'Gói VIP 1 đã được kích hoạt cho tin "Studio apartment modern"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
    actionUrl: '/dashboard/tin-dang',
    priority: 'medium',
  },
  {
    id: '7',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'NhaTroVN vừa ra mắt tính năng chat real-time!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
    actionUrl: '/chat',
    priority: 'low',
  },
  {
    id: '8',
    type: 'post_rejected',
    title: 'Tin đăng bị từ chối',
    message: 'Tin "Phòng trọ ABC" không đạt tiêu chuẩn. Vui lòng chỉnh sửa.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: false,
    actionUrl: '/dashboard/tin-dang',
    priority: 'high',
  },
];

const getNotificationIcon = (type: string, priority: string) => {
  const iconClass = `h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-gray-500'}`;
  
  switch (type) {
    case 'message':
      return <ChatBubbleLeftIcon className={iconClass} />;
    case 'call':
      return <PhoneIcon className={iconClass} />;
    case 'like':
      return <HeartIcon className={iconClass} />;
    case 'view':
      return <EyeIcon className={iconClass} />;
    case 'post_approved':
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'post_rejected':
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    case 'payment':
      return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
    case 'system':
      return <InformationCircleIcon className={iconClass} />;
    default:
      return <BellIcon className={iconClass} />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Quan trọng</span>;
    case 'medium':
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Trung bình</span>;
    default:
      return null;
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'important':
        return notification.priority === 'high';
      default:
        return true;
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.priority === 'high').length;

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.98) { // 2% chance every 3 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['view', 'like', 'message'][Math.floor(Math.random() * 3)] as 'view' | 'like' | 'message',
          title: 'Thông báo mới',
          message: 'Bạn có hoạt động mới trên tin đăng',
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationIds: string[]) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(prev => prev.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, isRead: true }
          : notification
      ));
      toastManager.showSuccess(`Đã đánh dấu ${notificationIds.length} thông báo là đã đọc`);
    } catch {
      toastManager.showError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (notificationIds: string[]) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${notificationIds.length} thông báo?`)) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      setSelectedNotifications([]);
      toastManager.showSuccess('Đã xóa thông báo');
    } catch {
      toastManager.showError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead([notification.id]);
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BellSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trung tâm thông báo</h1>
              <p className="text-gray-600">Theo dõi tất cả hoạt động và cập nhật</p>
            </div>
          </div>
          
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleMarkAsRead(selectedNotifications)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CheckIcon className="h-4 w-4 mr-1 inline" />
                Đánh dấu đã đọc
              </button>
              <button
                onClick={() => handleDelete(selectedNotifications)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-1 inline" />
                Xóa
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            <div className="text-sm text-blue-600">Tổng thông báo</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <div className="text-sm text-red-600">Chưa đọc</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{importantCount}</div>
            <div className="text-sm text-yellow-600">Quan trọng</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-green-600">Hôm nay</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chưa đọc ({unreadCount})
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('important')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'important'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quan trọng ({importantCount})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-700 hover:text-blue-800 transition-colors"
            >
              {selectedNotifications.length === filteredNotifications.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <button
              onClick={() => handleMarkAsRead(notifications.filter(n => !n.isRead).map(n => n.id))}
              disabled={unreadCount === 0 || isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'Tất cả thông báo đã được đọc' 
                : 'Thông báo sẽ xuất hiện tại đây khi có hoạt động mới'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                } ${selectedNotifications.includes(notification.id) ? 'bg-blue-100' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedNotifications(prev => [...prev, notification.id]);
                      } else {
                        setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-800'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        
                        <p className={`text-sm ${
                          !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>

                        {/* Related content */}
                        {notification.relatedProperty && (
                          <div className="flex items-center mt-2 p-2 bg-gray-50 rounded">
                            <Image
                              src={notification.relatedProperty.image}
                              alt={notification.relatedProperty.title}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded object-cover mr-2"
                            />
                            <span className="text-xs text-gray-600 truncate">
                              {notification.relatedProperty.title}
                            </span>
                          </div>
                        )}

                        {notification.relatedUser && (
                          <div className="flex items-center mt-2">
                            <Image
                              src={notification.relatedUser.avatar}
                              alt={notification.relatedUser.name}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover mr-2"
                            />
                            <span className="text-xs text-gray-600">
                              {notification.relatedUser.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {formatTime(notification.timestamp)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete([notification.id]);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt thông báo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Thông báo email</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Tin nhắn mới</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Cập nhật tin đăng</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Khuyến mãi đặc biệt</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Thông báo push</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Hoạt động quan trọng</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Lượt xem tin đăng</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Cập nhật hệ thống</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
