'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { toastManager } from '@/components/ui/ToastManager';
import { useChat } from '@/contexts/ChatContext';
import { Conversation, Message } from '@/lib/chatApi';
import { chatHelpers } from '@/lib/chatApi';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: {
    _id: string;
    full_name: string;
    avatar?: string;
  };
}

export default function ChatWindow({ conversation, currentUser }: ChatWindowProps) {
  const { messages, sendMessage, markMessageSeen, isLoading } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Emoji picker removed for simplified UI
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const partner = chatHelpers.getConversationPartner(conversation, currentUser._id);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track scroll to toggle FAB visibility
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 64;
      setShowScrollToBottom(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll as any);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark messages as seen when conversation is active
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender !== currentUser._id && lastMessage.status !== 'seen') {
        markMessageSeen(lastMessage._id);
      }
    }
  }, [messages, currentUser._id, markMessageSeen]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (!partner) {
      toastManager.showError('Không tìm thấy người nhận tin nhắn');
      return;
    }

    console.log('📤 ChatWindow - Sending message:', {
      text: newMessage,
      conversationId: conversation._id,
      partnerId: partner._id,
      partner: partner,
      currentMessages: messages.length
    });

    sendMessage(newMessage, conversation._id, partner._id);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toastManager.showInfo('Tính năng upload file đang được phát triển');
      // TODO: Implement file upload with socket
    }
  };

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const maxHeight = 120;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
  }, [newMessage]);

  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không xác định';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Không xác định';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const MessageStatusIcon = ({ status }: { status: string }) => {
    if (status === 'seen') {
      return (
        <span className="inline-flex items-center gap-0.5 text-blue-500">
          <CheckIcon className="h-3 w-3" />
          <CheckIcon className="h-3 w-3 -ml-2" />
        </span>
      );
    }
    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-0.5 text-gray-400">
          <CheckIcon className="h-3 w-3" />
          <CheckIcon className="h-3 w-3 -ml-2" />
        </span>
      );
    }
    if (status === 'sent') {
      return (
        <span className="inline-flex items-center text-gray-300">
          <CheckIcon className="h-3 w-3" />
        </span>
      );
    }
    return null;
  };

  // Group messages by date and ensure chronological order
  const groupedMessages = messages
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort messages chronologically
    .reduce((groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);

  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy thông tin người trò chuyện</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
                  <Image
                    src={partner.avatar || '/placeholder-room.svg'}
                    alt={partner.full_name || 'Unknown User'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{partner.full_name || 'Unknown User'}</h3>
                    <OnlineStatusIndicator isOnline={true} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="text-gray-600">{partner.role}</span>
                  </p>
                </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <VideoCameraIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <InformationCircleIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Conversation Info Banner removed per user preference */}

      {/* Messages - Only this section scrolls */}
      <div
        ref={messagesContainerRef}
        className="relative flex-1 overflow-y-auto p-4 bg-gray-50"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-6 w-48 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-gray-500">Hãy bắt đầu cuộc trò chuyện với {partner.full_name || 'người dùng'}.</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {['Xin chào!', 'Bạn có rảnh nói chuyện không?', 'Cho mình hỏi về phòng ạ'].map((reply) => (
                  <button
                    key={reply}
                    onClick={() => setNewMessage(reply)}
                    className="px-3 py-1.5 text-sm bg-white text-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {Object.entries(groupedMessages)
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()) // Sort dates chronologically
          .map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200">
                {formatDate(date)}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const isCurrentUser = chatHelpers.isMessageFromCurrentUser(message, currentUser._id);
              const isFirstOfGroup = index === 0 || dayMessages[index - 1].sender !== message.sender;
              const isLastOfGroup = index === dayMessages.length - 1 || dayMessages[index + 1].sender !== message.sender;
              
              // Debug logging
              if (index === 0) {
                console.log('Message sender debug:', {
                  messageSender: message.sender,
                  currentUserId: currentUser._id,
                  senderType: typeof message.sender,
                  userIdType: typeof currentUser._id,
                  isCurrentUser: isCurrentUser,
                  messageText: message.text
                });
              }
              
              const showAvatar = isFirstOfGroup;

              return (
                <div
                  key={message._id}
                  className={`flex items-end space-x-2 ${isFirstOfGroup ? 'mt-2' : 'mt-0.5'} mb-0.5 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <Image
                          src={partner.avatar || '/placeholder-room.svg'}
                          alt={partner.full_name || 'Unknown User'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-full md:max-w-[75%] px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    } ${
                      // Bubble radius to visually group consecutive messages
                      isCurrentUser
                        ? `${isFirstOfGroup ? 'rounded-t-2xl' : 'rounded-t-lg'} ${isLastOfGroup ? 'rounded-b-2xl' : 'rounded-b-lg'} rounded-l-2xl`
                        : `${isFirstOfGroup ? 'rounded-t-2xl' : 'rounded-t-lg'} ${isLastOfGroup ? 'rounded-b-2xl' : 'rounded-b-lg'} rounded-r-2xl`
                    }`}
                  >
                    <p className="text-sm">{message.text || ''}</p>
                           <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                                }`}
                              >
                               {formatTime(message.createdAt)}
                             </p>
                              {isCurrentUser && (
                                <span className="ml-2">
                                  <MessageStatusIcon status={message.status} />
                                </span>
                              )}
                           </div>
                  </div>

                  {isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <Image
                          src={currentUser.avatar || '/placeholder-room.svg'}
                          alt={currentUser.full_name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

              {/* Typing indicator */}
              {isTyping && (
                <TypingIndicator userName={partner?.full_name} />
              )}

        <div ref={messagesEndRef} />

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Cuộn xuống cuối"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
          </button>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2.5">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Message input */}
          <div className="flex-1 relative">
            {/* Attachment inside input */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              aria-label="Đính kèm"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
              rows={1}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 no-scrollbar"
              style={{ minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }}
            />
          </div>

          {/* Enhanced Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-[46px] w-[46px] flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow"
            aria-label="Gửi"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Enhanced Quick replies */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['Phòng còn trống không?', 'Giá có thương lượng được không?', 'Khi nào có thể xem phòng?'].map((reply) => (
            <button
              key={reply}
              onClick={() => setNewMessage(reply)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition border border-gray-200"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
