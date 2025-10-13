'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import SocketStatusIndicator from './SocketStatusIndicator';
import { useChat } from '@/contexts/ChatContext';
import { conversationApi } from '@/lib/chatApi';
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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    isLoading, 
    error,
    setActiveConversation,
    openConversation,
    clearError 
  } = useChat();
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const hasOpenedForUserRef = useRef<string | null>(null);
  const targetConversationIdRef = useRef<string | null>(null);
  const hasFetchedConversationByIdRef = useRef<string | null>(null);
  
  // Track if we're currently switching conversations to prevent race conditions
  const [isSwitchingConversation, setIsSwitchingConversation] = useState(false);

  // Snapshot primitive values from URL params to use as stable deps
  const spUserId = searchParams.get('userId');
  const spConversationId = searchParams.get('conversationId');
  const spPropertyId = searchParams.get('propertyId');
  const spFromProperty = searchParams.get('from') === 'property';

  // Handle userId and conversationId parameters from URL
  useEffect(() => {
    // Skip if we're currently switching conversations to prevent race conditions
    if (isSwitchingConversation) {
      // Allow effect to proceed only when URL matches the intended target
      const currentSpId = spConversationId;
      if (targetConversationIdRef.current && currentSpId !== targetConversationIdRef.current) {
        return;
      }
    }
    
    const userId = spUserId;
    const conversationId = spConversationId;
    const propertyId = spPropertyId;
    
    // Handle direct conversation ID
    if (conversationId) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation && activeConversation?._id !== conversationId) {
        console.log('🔄 URL triggered conversation switch:', conversationId);
        setActiveConversation(conversation);
        // Normalize URL to only conversationId, preserve propertyId if from property page
        const normalizedUrl = spFromProperty && propertyId 
          ? `/chat?conversationId=${conversationId}&propertyId=${propertyId}&from=property`
          : `/chat?conversationId=${conversationId}`;
        router.push(normalizedUrl, { scroll: false });

        // Clear switching state if this was the intended target
        if (targetConversationIdRef.current === conversationId) {
          targetConversationIdRef.current = null;
          setIsSwitchingConversation(false);
        }
      } else if (!conversation && conversationId && hasFetchedConversationByIdRef.current !== conversationId) {
        // Fallback: fetch conversation by ID when not present in list (e.g., deep link)
        hasFetchedConversationByIdRef.current = conversationId;
        (async () => {
          try {
            const res = await conversationApi.getConversationById(conversationId);
            if (res && (res.success || res.data)) {
              const conv = res.data as any;
              // Validate current user is participant before opening
              const isParticipant = conv?.participants?.some((p: any) => p?._id === user?._id);
              if (isParticipant) {
                setActiveConversation(conv);
                // Keep URL normalized with property context if provided
                const normalizedUrl = spFromProperty && propertyId 
                  ? `/chat?conversationId=${conversationId}&propertyId=${propertyId}&from=property`
                  : `/chat?conversationId=${conversationId}`;
                router.push(normalizedUrl, { scroll: false });
              }
            }
          } catch (e) {
            // swallow; UI will show empty state if not accessible
          }
        })();
      }
    }
    // Handle user ID (create or find conversation)
    else if (userId && user && userId !== user._id) {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p._id === userId)
      );
      
      if (existingConversation && activeConversation?._id !== existingConversation._id) {
        console.log('🔄 URL triggered existing conversation switch:', existingConversation._id);
        setActiveConversation(existingConversation);
        // Replace userId with conversationId to stop re-triggering
        const normalizedUrl = spFromProperty && propertyId 
          ? `/chat?conversationId=${existingConversation._id}&propertyId=${propertyId}&from=property`
          : `/chat?conversationId=${existingConversation._id}`;
        router.push(normalizedUrl, { scroll: false });
      } else if (!existingConversation) {
        // Guard against repeated opens while URL still has userId
        if (hasOpenedForUserRef.current !== userId) {
          hasOpenedForUserRef.current = userId;
          console.log('🔍 Opening conversation for user:', userId, 'from property:', spFromProperty);
          openConversation(userId);
        }
      }
    }
  // IMPORTANT: Do not depend on the unstable searchParams object; read specific values
  }, [
    user?._id,
    conversations,
    setActiveConversation,
    openConversation,
    activeConversation?._id,
    spUserId,
    spConversationId,
    spPropertyId,
    spFromProperty,
    router,
    isSwitchingConversation
  ]);

  // When a conversation becomes active while URL still contains userId, normalize URL
  useEffect(() => {
    if (!activeConversation) return;
    const hasUserIdOnly = searchParams.get('userId') && !searchParams.get('conversationId');
    if (hasUserIdOnly) {
      const propertyId = searchParams.get('propertyId');
      const fromProperty = searchParams.get('from') === 'property';
      const normalizedUrl = fromProperty && propertyId 
        ? `/chat?conversationId=${activeConversation._id}&propertyId=${propertyId}&from=property`
        : `/chat?conversationId=${activeConversation._id}`;
      router.push(normalizedUrl, { scroll: false });
    }
  }, [activeConversation?._id, router, searchParams]);

  const handleConversationSelect = (conversationId: string) => {
    // Prevent rapid switching
    if (isSwitchingConversation) {
      return;
    }
    
    const conversation = conversations.find(conv => String(conv._id) === String(conversationId));
    if (!conversation) {
      return;
    }
    
    // Prevent switching to the same conversation
    if (activeConversation?._id === conversationId) {
      setIsMobileSidebarOpen(false);
      return;
    }
    
    setIsSwitchingConversation(true);
    targetConversationIdRef.current = conversationId;

    // Push URL; the URL-driven effect will set active conversation once it matches target
    router.push(`/chat?conversationId=${String(conversationId)}`, { scroll: false });

    setIsMobileSidebarOpen(false);
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => {
    const unreadMap = conv.unread || {} as Record<string, number>;
    return sum + (unreadMap[user?._id || ''] || 0);
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
                    src={typeof partner.avatar === 'string' && partner.avatar.trim() !== '' ? partner.avatar : '/placeholder-room.svg'}
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
