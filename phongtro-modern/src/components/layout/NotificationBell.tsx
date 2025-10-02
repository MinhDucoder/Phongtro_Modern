'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNotification } from '@/hooks/useNotification';
import { toastManager } from '@/components/ui/ToastManager';
import { useAuth } from '@/contexts/AuthContext';

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

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    message: '💬',
    post_approved: '✅',
    post_rejected: '❌',
    payment: '💳',
    booking: '📅',
    system: 'ℹ️',
    view: '👁️',
    like: '❤️',
    call: '📞',
    review: '⭐',
  };
  return icons[type] || '🔔';
};

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCountRef = useRef(unreadCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Show toast when new notification arrives
  useEffect(() => {
    // Chỉ trigger khi có notification MỚI (không phải lần đầu load)
    if (unreadCount > prevUnreadCountRef.current) {
      // Tìm notification mới nhất (chưa đọc)
      const latestNotification = notifications.find(n => !n.isRead);
      
      if (latestNotification) {
        console.log('[NotificationBell] New notification received:', latestNotification);
        
        toastManager.showInfo(
          latestNotification.title,
          {
            description: latestNotification.content,
            duration: 5000,
            action: latestNotification.link ? {
              label: 'Xem',
              onClick: () => {
                window.location.href = latestNotification.link || '/thong-bao';
              }
            } : undefined
          }
        );
        
        // Trigger bell animation
        setHasNewNotification(true);
        setTimeout(() => setHasNewNotification(false), 3000);
      }
    }
    
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, notifications]);

  // Don't show for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notificationId: string, link?: string) => {
    markAsRead(notificationId);
    setIsOpen(false);
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors ${
          hasNewNotification ? 'animate-bounce' : ''
        }`}
        aria-label="Thông báo"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-blue-600">
                  ({unreadCount} chưa đọc)
                </span>
              )}
            </h3>
            <Link
              href="/thong-bao"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification._id, notification.link)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(new Date(notification.createdAt))}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <Link
                href="/thong-bao"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
              >
                Xem tất cả thông báo →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

