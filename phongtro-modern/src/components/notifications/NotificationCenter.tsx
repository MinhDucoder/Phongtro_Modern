'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getSafeImageSrc } from '@/lib/imageUtils';
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
  CheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { toastManager } from '@/components/ui/ToastManager';
import { useNotification, Notification as NotificationType } from '@/hooks/useNotification';
import { useRouter } from 'next/navigation';

// Helper to format notification for display
interface DisplayNotification {
  id: string;
  type: NotificationType['type'];
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
  priority: NotificationType['priority'];
}

const mapNotificationToDisplay = (notification: NotificationType): DisplayNotification => ({
  id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.content,
  timestamp: new Date(notification.createdAt),
  isRead: notification.isRead,
  actionUrl: notification.link || undefined,
  relatedProperty: notification.relatedProperty ? {
    id: notification.relatedProperty.id,
    title: notification.relatedProperty.title,
    image: notification.relatedProperty.image,
  } : undefined,
  relatedUser: notification.relatedUser ? {
    id: notification.relatedUser.id,
    name: notification.relatedUser.name,
    avatar: notification.relatedUser.avatar,
  } : undefined,
  priority: notification.priority,
});

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
    case 'booking':
      return <CalendarIcon className={iconClass} />;
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

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

export default function NotificationCenter() {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useNotification();

  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Map and filter notifications
  const displayNotifications = useMemo(() => {
    return notifications.map(mapNotificationToDisplay);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return displayNotifications.filter(notification => {
      switch (filter) {
        case 'unread':
          return !notification.isRead;
        case 'important':
          return notification.priority === 'high';
        default:
          return true;
      }
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [displayNotifications, filter]);

  const importantCount = displayNotifications.filter(n => n.priority === 'high').length;

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await Promise.all(notificationIds.map(id => markAsRead(id)));
      toastManager.showSuccess(`Đã đánh dấu ${notificationIds.length} thông báo là đã đọc`);
    } catch {
      toastManager.showError('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (notificationIds: string[]) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${notificationIds.length} thông báo?`)) return;
    
    try {
      await Promise.all(notificationIds.map(id => deleteNotification(id)));
      setSelectedNotifications([]);
      toastManager.showSuccess('Đã xóa thông báo');
    } catch {
      toastManager.showError('Có lỗi xảy ra');
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleNotificationClick = async (notification: DisplayNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toastManager.showSuccess('Đã đánh dấu tất cả là đã đọc');
    } catch {
      toastManager.showError('Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BellSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
              Thông báo
            </h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả thông báo của bạn</p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{displayNotifications.length}</div>
            <div className="text-sm text-gray-500">Tổng thông báo</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-gray-500">Chưa đọc</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{importantCount}</div>
            <div className="text-sm text-gray-500">Quan trọng</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setFilter('all');
              fetchNotifications('all');
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({displayNotifications.length})
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              fetchNotifications('unread');
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            onClick={() => {
              setFilter('important');
              fetchNotifications('important');
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'important' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quan trọng ({importantCount})
          </button>
        </div>

        {/* Batch Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-blue-900">
              Đã chọn {selectedNotifications.length} thông báo
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkAsRead(selectedNotifications)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <CheckIcon className="h-4 w-4 inline mr-1" />
                Đánh dấu đã đọc
              </button>
              <button
                onClick={() => handleDelete(selectedNotifications)}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4 inline mr-1" />
                Xóa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* List Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={filteredNotifications.length > 0 && selectedNotifications.length === filteredNotifications.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Chọn tất cả</span>
          </div>
          <span className="text-sm text-gray-500">
            {filteredNotifications.length} thông báo
          </span>
        </div>

        {/* Notifications */}
        <div className="divide-y divide-gray-200">
          {isLoading && filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không có thông báo nào
            </div>
          ) : (
            filteredNotifications.map((notification) => (
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
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-4">
                        {getPriorityBadge(notification.priority)}
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    
                    {/* Related Property/User */}
                    {notification.relatedProperty && (
                      <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded">
                        <Image
                          src={getSafeImageSrc(notification.relatedProperty.image)}
                          alt={notification.relatedProperty.title}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <span className="text-xs text-gray-600">{notification.relatedProperty.title}</span>
                      </div>
                    )}
                    
                    {notification.relatedUser && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Image
                          src={getSafeImageSrc(notification.relatedUser.avatar)}
                          alt={notification.relatedUser.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="text-xs text-gray-600">{notification.relatedUser.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
