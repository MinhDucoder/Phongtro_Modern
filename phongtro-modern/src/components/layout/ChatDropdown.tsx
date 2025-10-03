'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';

const formatTimestamp = (date: string | Date) => {
  const messageDate = new Date(date);
  const now = new Date();
  const diff = now.getTime() - messageDate.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;
  
  return messageDate.toLocaleDateString('vi-VN');
};

const getAvatarUrl = (avatar: any): string => {
  if (!avatar) return '/placeholder-room.svg';
  if (typeof avatar === 'string') return avatar.trim() || '/placeholder-room.svg';
  if (typeof avatar === 'object') {
    return avatar.url || avatar.secure_url || '/placeholder-room.svg';
  }
  return '/placeholder-room.svg';
};

export default function ChatDropdown() {
  const { isAuthenticated, user } = useAuth();
  const { conversations, totalUnread } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Don't show for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  // Get recent conversations (max 5)
  const recentConversations = conversations.slice(0, 5);

  const handleConversationClick = (conversationId: string) => {
    setIsOpen(false);
    router.push(`/profile?tab=chat&conversationId=${conversationId}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        aria-label="Tin nhắn"
        title="Tin nhắn"
      >
        {totalUnread > 0 ? (
          <ChatSolidIcon className="h-5 w-5 text-blue-600" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        )}
        
        {/* Unread Badge */}
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Tin nhắn
              {totalUnread > 0 && (
                <span className="ml-2 text-xs text-blue-600">
                  ({totalUnread} chưa đọc)
                </span>
              )}
            </h3>
            <Link
              href="/profile?tab=chat"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          {/* Conversations List */}
          <div className="max-h-96 overflow-y-auto">
            {recentConversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              recentConversations.map((conv) => {
                const otherUser = conv.participants.find((p: any) => p._id !== user?._id);
                const unreadCount = conv.unread?.[user?._id || ''] || 0;
                const isUnread = unreadCount > 0;

                return (
                  <button
                    key={conv._id}
                    onClick={() => handleConversationClick(conv._id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      isUnread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {otherUser?.avatar ? (
                          <img
                            src={getAvatarUrl(otherUser.avatar)}
                            alt={otherUser.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {otherUser?.full_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                            {otherUser?.full_name || 'Unknown User'}
                          </p>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        {conv.lastMessage?.text && (
                          <p className={`text-sm line-clamp-1 ${isUnread ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                            {conv.lastMessage.sender === user?._id ? 'Bạn: ' : ''}
                            {conv.lastMessage.text}
                          </p>
                        )}
                      </div>

                      {/* Unread Indicator */}
                      {isUnread && (
                        <div className="flex-shrink-0 flex flex-col items-end">
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {recentConversations.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <Link
                href="/profile?tab=chat"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
              >
                Xem tất cả tin nhắn →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

