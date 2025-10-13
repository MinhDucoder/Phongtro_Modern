'use client';

import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
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
import { useSocket } from '@/contexts/SocketContext';
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

const ChatWindow = memo(function ChatWindow({ conversation, currentUser }: ChatWindowProps) {
  const { messages, sendMessage, markMessageSeen, isLoading, onlineUsers, typingUsers, retryMessage } = useChat();
  const { socket } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Emoji picker removed for simplified UI
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const partner = chatHelpers.getConversationPartner(conversation, currentUser._id);
  const isPartnerOnline = partner ? onlineUsers.has(partner._id) : false;
  
  // Get propertyId from URL for context
  const [propertyIdFromUrl, setPropertyIdFromUrl] = useState<string | null>(null);
  const [isFromProperty, setIsFromProperty] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setPropertyIdFromUrl(urlParams.get('propertyId'));
      setIsFromProperty(urlParams.get('from') === 'property');
    }
  }, []);

  // Track if user is at bottom
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto scroll to bottom only if user is already at bottom
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Track scroll to toggle FAB visibility and detect if at bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollThreshold = 100; // Increased threshold for better UX
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold;
      
      setIsAtBottom(isNearBottom);
      setShowScrollToBottom(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll as any);
  }, []);

  const scrollToBottom = () => {
    setIsAtBottom(true);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    if (!partner) {
      toastManager.showError('Không tìm thấy người nhận tin nhắn');
      return;
    }

    setIsSending(true);
    
    try {
      console.log('📤 ChatWindow - Sending message:', {
        text: newMessage,
        conversationId: conversation._id,
        partnerId: partner._id,
        partner: partner,
        currentMessages: messages.length
      });

      await sendMessage(newMessage, conversation._id, partner._id);
      setNewMessage('');
      
      // Clear typing indicator when message is sent
      if (socket && partner) {
        socket.emit('typingStop', {
          conversationId: conversation._id,
          receiver: partner._id
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape to clear message
    if (e.key === 'Escape') {
      setNewMessage('');
    }
    // Ctrl/Cmd + Enter to send (alternative to Enter)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!socket || !partner) return;

    // Emit typing start
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typingStart', {
        conversationId: conversation._id,
        receiver: partner._id,
        userName: currentUser.full_name
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typingStop', {
        conversationId: conversation._id,
        receiver: partner._id
      });
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toastManager.showInfo('Tính năng upload file đang được phát triển');
      // TODO: Implement file upload with socket
    }
  };

  // Auto-resize textarea - memoized to avoid unnecessary re-renders
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTextarea = useCallback(() => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const maxHeight = 120;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [newMessage, resizeTextarea]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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

  const MessageStatusIcon = ({ status, messageId }: { status: string; messageId: string }) => {
    if (status === 'failed') {
      return (
        <button
          onClick={() => retryMessage(messageId)}
          className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
          title="Gửi lại"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-xs">Gửi lại</span>
        </button>
      );
    }
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

  // Group messages by date and ensure chronological order (immutable + memoized)
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return {};
    
    return [...messages]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .reduce((groups, message) => {
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {} as Record<string, Message[]>);
  }, [messages.length, messages.map(m => `${m._id}-${m.createdAt}`).join(',')]);

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
                    <OnlineStatusIndicator isOnline={isPartnerOnline} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="text-gray-600">{partner.role}</span>
                  </p>
                </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Gọi điện"
          >
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Gọi video"
          >
            <VideoCameraIcon className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Thông tin cuộc trò chuyện"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Tùy chọn khác"
          >
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
        role="log"
        aria-label="Tin nhắn cuộc trò chuyện"
        aria-live="polite"
        aria-atomic="false"
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
              
              
              
              const showAvatar = isFirstOfGroup;

              return (
                <div
                  key={message._id}
                  className={`flex items-end space-x-2 ${isFirstOfGroup ? 'mt-2' : 'mt-0.5'} mb-0.5 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                  role="listitem"
                  aria-label={`Tin nhắn từ ${isCurrentUser ? 'bạn' : partner?.full_name}: ${message.text}`}
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
                                  <MessageStatusIcon status={message.status} messageId={message._id} />
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
              {typingUsers.size > 0 && (
                <TypingIndicator userName={Array.from(typingUsers.values()).join(', ')} />
              )}

        <div ref={messagesEndRef} />

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px]"
            aria-label="Cuộn xuống cuối"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
          </button>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
        {/* Character counter */}
        {newMessage.length > 100 && (
          <div className="mb-2 text-right">
            <span className={`text-xs ${newMessage.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {newMessage.length}/1000
            </span>
          </div>
        )}
        
        {/* Screen reader help text */}
        <div id="message-help" className="sr-only">
          Nhập tin nhắn của bạn. Sử dụng Enter để gửi, Shift+Enter để xuống dòng, Escape để xóa.
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-2.5">
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
              disabled={isSending}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
              aria-label="Đính kèm"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setNewMessage(e.target.value);
                  handleTyping();
                }
              }}
              onKeyPress={handleKeyPress}
              onKeyDown={handleKeyDown}
              placeholder={isSending ? "Đang gửi..." : "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"}
              rows={1}
              maxLength={1000}
              disabled={isSending}
              aria-label="Nhập tin nhắn"
              aria-describedby="message-help"
              className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 no-scrollbar ${
                isSending ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
              style={{ minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }}
            />
          </div>

          {/* Enhanced Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-full transition-all duration-200 shadow ${
              isSending 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            aria-label={isSending ? "Đang gửi..." : "Gửi"}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Enhanced Quick replies - Hidden on mobile to save space */}
        <div className="hidden sm:flex flex-wrap gap-2 mt-4">
          {(isFromProperty && propertyIdFromUrl) ? [
            'Xin chào! Tôi quan tâm đến phòng trọ này',
            'Phòng còn trống không?',
            'Khi nào có thể xem phòng?',
            'Giá có thương lượng được không?'
          ] : [
            'Xin chào!',
            'Bạn có rảnh nói chuyện không?',
            'Cho mình hỏi về phòng ạ'
          ].map((reply) => (
            <button
              key={reply}
              onClick={() => setNewMessage(reply)}
              disabled={isSending}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ChatWindow;
