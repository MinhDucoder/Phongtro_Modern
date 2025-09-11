'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { 
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Mock data - trong thực tế sẽ fetch từ API hoặc WebSocket
const mockConversations = [
  {
    id: '1',
    participant: {
      id: '2',
      name: 'Chị Hoa',
      avatar: '/placeholder-room.svg',
      isOnline: true,
      lastSeen: null,
    },
    property: {
      id: '1',
      title: 'Phòng trọ gần ĐH Bách Khoa',
      image: '/placeholder-room.svg',
    },
    lastMessage: {
      content: 'Phòng còn trống không ạ?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      senderId: '2',
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    participant: {
      id: '3',
      name: 'Anh Nam',
      avatar: '/placeholder-room.svg',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    property: {
      id: '2',
      title: 'Căn hộ mini có ban công',
      image: '/placeholder-room.svg',
    },
    lastMessage: {
      content: 'Cảm ơn bạn, tôi sẽ liên hệ lại sau',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      senderId: '3',
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    participant: {
      id: '4',
      name: 'Chị Lan',
      avatar: '/placeholder-room.svg',
      isOnline: true,
      lastSeen: null,
    },
    property: {
      id: '3',
      title: 'Nhà nguyên căn 2PN',
      image: '/placeholder-room.svg',
    },
    lastMessage: {
      content: 'Tôi có thể xem nhà vào cuối tuần được không?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      senderId: '4',
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    participant: {
      id: '5',
      name: 'Anh Minh',
      avatar: '/placeholder-room.svg',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    property: {
      id: '4',
      title: 'Studio apartment modern',
      image: '/placeholder-room.svg',
    },
    lastMessage: {
      content: 'Phòng rất đẹp, giá cả hợp lý',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      senderId: '1', // Current user
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

interface ChatLayoutProps {
  activeConversationId?: string;
}

export default function ChatLayout({ activeConversationId }: ChatLayoutProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    activeConversationId || null
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Current user info
  const currentUser = {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: '/placeholder-room.svg',
  };

  useEffect(() => {
    if (activeConversationId) {
      setSelectedConversation(activeConversationId);
    }
  }, [activeConversationId]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new messages
      if (Math.random() > 0.95) { // 5% chance every second
        const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
        const newMessage = {
          content: [
            'Bạn có thể cho tôi xem thêm ảnh không?',
            'Phòng còn trống không ạ?',
            'Giá có thương lượng được không?',
            'Khi nào có thể xem phòng?',
            'Cảm ơn bạn!',
          ][Math.floor(Math.random() * 5)],
          timestamp: new Date(),
          senderId: randomConversation.participant.id,
        };

        setConversations(prev => prev.map(conv => 
          conv.id === randomConversation.id
            ? {
                ...conv,
                lastMessage: newMessage,
                unreadCount: conv.id === selectedConversation ? 0 : conv.unreadCount + 1,
                updatedAt: new Date(),
              }
            : conv
        ));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [conversations, selectedConversation]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setIsMobileSidebarOpen(false);
    
    // Mark as read
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: 0 }
        : conv
    ));

    // Update URL
    router.push(`/chat/${conversationId}`);
  };

  const handleNewMessage = (conversationId: string, message: {id: string, text: string, timestamp: string, sender: string}) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? {
            ...conv,
            lastMessage: {
              content: message.text,
              timestamp: new Date(message.timestamp),
              senderId: message.sender
            },
            updatedAt: new Date(),
          }
        : conv
    ));
  };

  const activeConversation = conversations.find(conv => conv.id === selectedConversation);
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-3"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tin nhắn</h1>
                {totalUnreadCount > 0 && (
                  <p className="text-sm text-gray-500">
                    {totalUnreadCount} tin nhắn chưa đọc
                  </p>
                )}
              </div>
            </div>
            
            {activeConversation && (
              <div className="hidden sm:flex items-center">
                <Image
                  src={activeConversation.participant.avatar}
                  alt={activeConversation.participant.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activeConversation.participant.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeConversation.participant.isOnline ? (
                      <span className="text-green-600">Đang online</span>
                    ) : (
                      `Hoạt động ${activeConversation.participant.lastSeen?.toLocaleTimeString('vi-VN')}`
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex">
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
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:bg-white">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            currentUser={currentUser}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <ChatWindow
              conversation={activeConversation!}
              currentUser={currentUser}
              onNewMessage={handleNewMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="text-gray-500">
                  Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
