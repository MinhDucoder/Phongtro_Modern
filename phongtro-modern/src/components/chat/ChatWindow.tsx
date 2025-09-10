'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhotoIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: Date | null;
  };
  property: {
    id: string;
    title: string;
    image: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: Date;
}

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
  onNewMessage: (conversationId: string, message: any) => void;
}

// Mock messages data
const generateMockMessages = (conversationId: string, currentUserId: string, participantId: string): Message[] => {
  const baseMessages = [
    { content: 'Chào bạn! Tôi quan tâm đến tin đăng này', senderId: participantId, type: 'text' as const },
    { content: 'Chào bạn! Phòng vẫn còn trống ạ', senderId: currentUserId, type: 'text' as const },
    { content: 'Vậy giá thuê là bao nhiêu ạ?', senderId: participantId, type: 'text' as const },
    { content: 'Giá thuê là 3.5 triệu/tháng bạn nhé, đã bao gồm điện nước', senderId: currentUserId, type: 'text' as const },
    { content: 'Bạn có thể cho tôi xem thêm ảnh phòng được không?', senderId: participantId, type: 'text' as const },
    { content: 'Được ạ, tôi sẽ gửi thêm ảnh cho bạn', senderId: currentUserId, type: 'text' as const },
    { content: 'Khi nào bạn có thể đến xem phòng?', senderId: currentUserId, type: 'text' as const },
    { content: 'Tôi có thể đến xem vào cuối tuần này được không ạ?', senderId: participantId, type: 'text' as const },
    { content: 'Được bạn, tôi sẽ sắp xếp thời gian. Bạn có thể đến vào chủ nhật không?', senderId: currentUserId, type: 'text' as const },
    { content: 'Phòng còn trống không ạ?', senderId: participantId, type: 'text' as const },
  ];

  return baseMessages.map((msg, index) => ({
    id: `${conversationId}-${index}`,
    content: msg.content,
    senderId: msg.senderId,
    timestamp: new Date(Date.now() - (baseMessages.length - index) * 10 * 60 * 1000), // 10 minutes apart
    type: msg.type,
    isRead: true,
  }));
};

export default function ChatWindow({ conversation, currentUser, onNewMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages for this conversation
  useEffect(() => {
    const mockMessages = generateMockMessages(conversation.id, currentUser.id, conversation.participant.id);
    setMessages(mockMessages);
  }, [conversation.id, currentUser.id, conversation.participant.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (Math.random() > 0.98) { // 2% chance to show typing
      setIsTyping(true);
      typingTimeout = setTimeout(() => setIsTyping(false), 3000);
    }

    return () => clearTimeout(typingTimeout);
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `${conversation.id}-${Date.now()}`,
      content: newMessage,
      senderId: currentUser.id,
      timestamp: new Date(),
      type: 'text',
      isRead: false,
    };

    setMessages(prev => [...prev, message]);
    onNewMessage(conversation.id, {
      content: newMessage,
      timestamp: new Date(),
      senderId: currentUser.id,
    });
    
    setNewMessage('');

    // Simulate response after 2-5 seconds
    setTimeout(() => {
      const responses = [
        'Cảm ơn bạn!',
        'Tôi sẽ xem xét và phản hồi lại',
        'Được ạ, không vấn đề gì',
        'Bạn có thể liên hệ trực tiếp với tôi qua số điện thoại',
        'Tôi sẽ sắp xếp thời gian phù hợp',
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: Message = {
        id: `${conversation.id}-${Date.now()}-response`,
        content: response,
        senderId: conversation.participant.id,
        timestamp: new Date(),
        type: 'text',
        isRead: false,
      };

      setMessages(prev => [...prev, responseMessage]);
      onNewMessage(conversation.id, {
        content: response,
        timestamp: new Date(),
        senderId: conversation.participant.id,
      });
    }, Math.random() * 3000 + 2000);
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
      // Simulate file upload
      toast.success('File đã được tải lên!');
      
      const message: Message = {
        id: `${conversation.id}-${Date.now()}`,
        content: `Đã gửi file: ${file.name}`,
        senderId: currentUser.id,
        timestamp: new Date(),
        type: 'file',
        fileName: file.name,
        isRead: false,
      };

      setMessages(prev => [...prev, message]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
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

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.timestamp.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={conversation.participant.avatar}
              alt={conversation.participant.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            {conversation.participant.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{conversation.participant.name}</h3>
            <p className="text-sm text-gray-500">
              {conversation.participant.isOnline ? (
                <span className="text-green-600">Đang online</span>
              ) : (
                `Hoạt động ${conversation.participant.lastSeen?.toLocaleTimeString('vi-VN')}`
              )}
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

      {/* Property Info Banner */}
      <div className="p-3 bg-blue-50 border-b">
        <div className="flex items-center space-x-3">
          <Image
            src={conversation.property.image}
            alt={conversation.property.title}
            width={40}
            height={40}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{conversation.property.title}</p>
            <p className="text-xs text-gray-500">Tin đăng đang thảo luận</p>
          </div>
          <a
            href={`/phong-tro/${conversation.property.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tin
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDate(new Date(date))}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUser.id;
              const showAvatar = index === 0 || dayMessages[index - 1].senderId !== message.senderId;

              return (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 mb-4 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <Image
                          src={conversation.participant.avatar}
                          alt={conversation.participant.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <Image
                          src={currentUser.avatar}
                          alt={currentUser.name}
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
          <div className="flex items-end space-x-2 mb-4">
            <Image
              src={conversation.participant.avatar}
              alt={conversation.participant.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-white border rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-end space-x-3">
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Emoji button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Quick replies */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Phòng còn trống không?', 'Giá có thương lượng được không?', 'Khi nào có thể xem phòng?'].map((reply) => (
            <button
              key={reply}
              onClick={() => setNewMessage(reply)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
