'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Conversation } from '@/lib/chatApi';
import { chatHelpers } from '@/lib/chatApi';

interface UserConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export default function UserConversationList({
  conversations,
  activeConversation,
  onSelectConversation,
  currentUserId
}: UserConversationListProps) {
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unread[currentUserId] || 0;
  };

  const isActive = (conversation: Conversation) => {
    return activeConversation?._id === conversation._id;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 min-h-0">
      {/* Enhanced Header - Compact */}
      <div className="p-2 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Cuộc trò chuyện
            </h2>
            <p className="text-xs text-gray-500">
              {conversations.length} cuộc trò chuyện
            </p>
          </div>
          <button className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-white/80 rounded-lg transition-all duration-200">
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/80 transition-all duration-200"
          />
        </div>
      </div>

        {/* Conversations List - Only this section scrolls */}
        <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-center">Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const partner = chatHelpers.getConversationPartner(conversation, currentUserId);
              const unreadCount = getUnreadCount(conversation);
              const isConversationActive = isActive(conversation);
              
              if (!partner) return null;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation._id)}
                  className={`p-3 hover:bg-white cursor-pointer transition-all duration-200 ${
                    isConversationActive ? 'bg-white border-r-4 border-blue-500 shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Image
                        src={partner.avatar || '/placeholder-room.svg'}
                        alt={partner.full_name || 'Unknown User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`text-sm font-medium truncate ${
                          unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {partner.full_name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className={`text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium ${
                              unreadCount > 9 
                                ? 'bg-red-500 text-white px-1 min-w-[20px]' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Role info */}
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-gray-500 truncate">
                          {partner.role === 'landlord' ? 'Chủ trọ' : 'Người thuê'}
                        </span>
                      </div>

                      {/* Last message */}
                      {conversation.lastMessage ? (
                        <div className="flex items-center space-x-1">
                          <p className={`text-sm truncate ${
                            unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.sender === currentUserId ? (
                              <span className="text-gray-500">Bạn: </span>
                            ) : (
                              conversation.lastMessage.sender === partner?._id && (
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              )
                            )}
                            {conversation.lastMessage.text?.length > 50 
                              ? conversation.lastMessage.text.substring(0, 50) + '...' 
                              : conversation.lastMessage.text}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Chưa có tin nhắn nào</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{conversations.length} cuộc trò chuyện</span>
          <span>{conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0)} chưa đọc</span>
        </div>
      </div>
    </div>
  );
}
