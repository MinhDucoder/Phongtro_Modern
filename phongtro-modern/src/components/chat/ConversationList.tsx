'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Conversation } from '@/lib/chatApi';
import { chatHelpers } from '@/lib/chatApi';

// Using Conversation type from chatApi

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onConversationSelect: (conversationId: string) => void;
  currentUser: {
    _id: string;
    full_name: string;
    avatar?: string;
  };
}

const ConversationList = memo(function ConversationList({
  conversations,
  selectedConversation,
  onConversationSelect,
  currentUser
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filter conversations
  const filteredConversations = conversations
    .filter(conv => {
      const partner = chatHelpers.getConversationPartner(conv, currentUser._id);
      const matchesSearch = partner && partner.full_name ? 
        partner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const unreadCount = chatHelpers.getUnreadCount(conv, currentUser._id);
      const matchesFilter = filter === 'all' || (filter === 'unread' && unreadCount > 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const formatTime = (dateString: string) => {
    return chatHelpers.formatMessageTime(dateString);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)} giờ`;
    if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))} ngày`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => {
    return sum + chatHelpers.getUnreadCount(conv, currentUser._id);
  }, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header - Compact */}
      <div className="p-3 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Cuộc trò chuyện
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredConversations.length} cuộc trò chuyện
            </p>
          </div>
          <button className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm">
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất cả ({conversations.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors relative ${
              filter === 'unread'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chưa đọc ({totalUnreadCount})
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

        {/* Conversations List - Only this section scrolls */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-center">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const partner = chatHelpers.getConversationPartner(conversation, currentUser._id);
              const unreadCount = chatHelpers.getUnreadCount(conversation, currentUser._id);
              const isSelected = selectedConversation === conversation._id;
              
              if (!partner) return null;
              
              return (
            <div
              key={conversation._id}
              onClick={() => onConversationSelect(String(conversation._id))}
              className={`p-3 hover:bg-white cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-white border-r-4 border-blue-500 shadow-sm' : ''
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
                              {formatLastMessageTime(conversation.lastMessage.createdAt)}
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
                          {partner.role}
                        </span>
                      </div>

                      {/* Last message */}
                      {conversation.lastMessage ? (
                        <div className="flex items-center space-x-1">
                          <p className={`text-sm truncate ${
                            unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.sender === currentUser._id ? (
                              <span className="text-gray-500">Bạn: </span>
                            ) : (
                              conversation.lastMessage.sender === partner?._id && (
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              )
                            )}
                            {truncateMessage(conversation.lastMessage.text || '')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Chưa có tin nhắn nào</p>
                      )}
                    </div>

                    {/* Options menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle options menu
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredConversations.length} cuộc trò chuyện</span>
          <span>{totalUnreadCount} chưa đọc</span>
        </div>
      </div>
    </div>
  );
});

export default ConversationList;
