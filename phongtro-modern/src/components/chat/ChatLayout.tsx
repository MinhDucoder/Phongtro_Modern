'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import SocketStatusIndicator from './SocketStatusIndicator';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Removed mock data - now using real data from ChatContext

interface ChatLayoutProps {
  activeConversationId?: string;
}

export default function ChatLayout({ activeConversationId }: ChatLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    isLoading, 
    error,
    setActiveConversation,
    clearError 
  } = useChat();
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeConversationId) {
      const conversation = conversations.find(conv => conv._id === activeConversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [activeConversationId, conversations, setActiveConversation]);

  const handleConversationSelect = (conversationId: string) => {
    const conversation = conversations.find(conv => conv._id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      setIsMobileSidebarOpen(false);
      router.push(`/chat/${conversationId}`);
    }
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => {
    return sum + (conv.unread[user?._id || ''] || 0);
  }, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Vui lòng đăng nhập
          </h3>
          <p className="text-gray-500">
            Bạn cần đăng nhập để sử dụng tính năng chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex p-0 overflow-hidden">
      {/* Main Chat Container - Full viewport height, no page scroll */}
      <div className="w-full h-full bg-white rounded-none overflow-hidden flex flex-col">
        {/* Header - Solid background, no blur */}
        <div className="bg-white border-b border-gray-200">
        <div className="px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 mr-3"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-gray-900">
                      Tin nhắn
                    </h1>
                    <SocketStatusIndicator />
                  </div>
                  {totalUnreadCount > 0 ? (
                    <p className="text-sm text-blue-600 font-medium">
                      {totalUnreadCount} tin nhắn chưa đọc
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {conversations.length} cuộc trò chuyện
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {activeConversation && (() => {
              const partner = activeConversation.participants.find(p => p._id !== user._id);
              return partner && (
                <div className="hidden sm:flex items-center">
                  <Image
                    src={partner.avatar || '/placeholder-room.svg'}
                    alt={partner.full_name || 'Unknown User'}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full mr-2"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {partner.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-600">{partner.role}</span>
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <ConversationList
                conversations={conversations}
                selectedConversation={activeConversation?._id || null}
                onConversationSelect={handleConversationSelect}
                currentUser={{
                  _id: user._id,
                  full_name: user.full_name,
                  avatar: typeof user.avatar === 'string' ? user.avatar : user.avatar?.url
                }}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar - Compact width */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:bg-gray-50">
          <ConversationList
            conversations={conversations}
            selectedConversation={activeConversation?._id || null}
            onConversationSelect={handleConversationSelect}
            currentUser={{
              _id: user._id,
              full_name: user.full_name,
              avatar: typeof user.avatar === 'string' ? user.avatar : user.avatar?.url
            }}
          />
        </div>

        {/* Chat Window - Takes remaining space */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              currentUser={{
                _id: user._id,
                full_name: user.full_name,
                avatar: typeof user.avatar === 'string' ? user.avatar : user.avatar?.url
              }}
            />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-lg mx-auto px-6">
                      <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                          <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chào mừng đến với Tin nhắn
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                          <p className="text-sm font-medium text-gray-700">Tin nhắn tức thì</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                          <p className="text-sm font-medium text-gray-700">Bảo mật cao</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                          <p className="text-sm font-medium text-gray-700">Đa nền tảng</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">
                          💡 <strong className="text-gray-800">Mẹo:</strong> Thêm <code className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-mono">?debug=true</code> vào URL để hiển thị công cụ test
                        </p>
                      </div>
                    </div>
                  </div>
                 )}
        </div>
      </div>
      </div>
    </div>
  );
}
