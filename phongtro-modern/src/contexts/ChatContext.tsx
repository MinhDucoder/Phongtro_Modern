'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { conversationApi, messageApi, chatHelpers, Conversation, Message } from '@/lib/chatApi';
import { toastManager } from '@/components/ui/ToastManager';

interface ChatContextType {
  // State
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  totalUnread: number;
  onlineUsers: Set<string>; // Track online users
  typingUsers: Map<string, string>; // Track typing users
  pendingMessages: Map<string, Message>; // Track pending messages
  
  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string, forceRefresh?: boolean) => Promise<void>;
  sendMessage: (text: string, conversationId?: string, receiver?: string) => Promise<void>;
  markMessageSeen: (messageId: string) => Promise<void>;
  openConversation: (otherUserId: string) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  clearError: () => void;
  retryMessage: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()); // userId -> userName
  const [pendingMessages, setPendingMessages] = useState<Map<string, Message>>(new Map()); // messageId -> message
  const [messageCache, setMessageCache] = useState<Map<string, Message[]>>(new Map()); // conversationId -> messages

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Add new conversation to the list
  const addConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => {
      // Check if conversation already exists
      const exists = prev.some(conv => conv._id === conversation._id);
      if (exists) return prev;
      
      // Add new conversation to the beginning of the list
      return [conversation, ...prev];
    });
  }, []);

  // Enhanced setActiveConversation with logging and room management
  const setActiveConversationEnhanced = useCallback((conversation: Conversation | null) => {
    // Leave previous conversation room if exists
    if (activeConversation && socket && activeConversation._id !== conversation?._id) {
      socket.emit('leaveConversation', { conversationId: activeConversation._id });
    }
    
    // Clear messages and typing indicators immediately to prevent showing old data
    setMessages([]);
    setTypingUsers(new Map());
    
    setActiveConversation(conversation);
    
    // Join new conversation room if exists
    if (conversation && socket) {
      socket.emit('joinConversation', { conversationId: conversation._id });
    }
  }, [activeConversation, socket]);

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await conversationApi.getConversations({ limit: 50 });
      
      if (response.success) {
        // Backend returns { success: true, items, total } directly
        // Frontend expects { success: true, data: { items, total } }
        const conversations = response.data?.items || response.items || [];
        setConversations(conversations);
      } else {
        setError(response.message || 'Failed to load conversations');
      }
    } catch (error) {
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Track loading state per conversation to prevent race conditions
  const [loadingConversations, setLoadingConversations] = useState<Set<string>>(new Set());
  
  // Load messages for a conversation with race condition protection and caching
  const loadMessages = useCallback(async (conversationId: string, forceRefresh = false) => {
    // Prevent duplicate loading for the same conversation
    if (loadingConversations.has(conversationId)) {
      console.log('⏳ Already loading messages for conversation:', conversationId);
      return;
    }
    
    // Check cache first (unless force refresh)
    const cachedMessages = messageCache.get(conversationId);
    if (cachedMessages && !forceRefresh) {
      console.log('💾 Using cached messages for conversation:', conversationId);
      setMessages(cachedMessages);
      return;
    }
    
    try {
      setLoadingConversations(prev => new Set(prev).add(conversationId));
      setIsLoading(true);
      
      console.log('📨 Loading messages for conversation:', conversationId, forceRefresh ? '(force refresh)' : '');
      const response = await messageApi.getMessages(conversationId, { limit: 50 });
      
      if (response.success) {
        // Backend returns { success: true, items, total } directly
        const messages = response.data?.items || response.items || [];
        
        // Only update messages if this is still the active conversation
        if (activeConversation?._id === conversationId) {
          setMessages(messages);
          console.log('✅ Loaded and set', messages.length, 'messages for active conversation:', conversationId);
        } else {
          console.log('⚠️ Conversation changed while loading, not setting messages for:', conversationId);
        }
        
        // Cache the messages regardless
        setMessageCache(prev => new Map(prev).set(conversationId, messages));
        
      } else {
        setError(response.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoadingConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversationId);
        return newSet;
      });
      setIsLoading(false);
    }
  }, [loadingConversations, messageCache, activeConversation?._id]);

  // Send message via socket
  const sendMessage = useCallback(async (text: string, conversationId?: string, receiver?: string) => {
    if (!socket || !user || !text.trim()) {
      return;
    }

    // Validate required fields
    if (!receiver || !receiver.trim()) {
      toastManager.showError('Receiver is required');
      return;
    }

    try {
      const messageData = {
        conversationId: conversationId ? conversationId.trim() : undefined,
        receiver: receiver.trim(),
        text: text.trim(),
      };

      console.log('📤 ChatContext - Sending message with data:', messageData);
      console.log('Socket connected:', socket.connected);
      console.log('Socket ID:', socket.id);

      // Create optimistic message with unique temp ID
      const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage: Message = {
        _id: tempMessageId,
        conversationId: conversationId || '',
        sender: user._id,
        receiver: receiver,
        text: text,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic message to UI immediately
      if (activeConversation && (conversationId === activeConversation._id || !conversationId)) {
        setMessages(prev => {
          // Double check for duplicates
          if (prev.some(m => m._id === tempMessageId || (m.text === text && m.sender === user._id && Math.abs(new Date(m.createdAt).getTime() - new Date().getTime()) < 1000))) {
            return prev;
          }
          return [...prev, tempMessage];
        });
        
        // Track as pending message
        setPendingMessages(prev => new Map(prev).set(tempMessageId, tempMessage));
      }

      // Use socket to send message
      socket.emit('sendMessage', messageData, (response: any) => {
        if (!response.success) {
          setError(response.error || 'Failed to send message');
          toastManager.showError(response.error || 'Failed to send message');
          
          // Mark message as failed instead of removing
          setMessages(prev => prev.map(m => 
            m._id === tempMessageId 
              ? { ...m, status: 'failed' as any }
              : m
          ));
        } else {
          // Join conversation room if not already joined
          const finalConversationId = response.conversationId || conversationId;
          if (finalConversationId) {
            socket.emit('joinConversation', { conversationId: finalConversationId });
          }
          
          // Update optimistic message with real ID
          if (response.messageId && response.messageId !== tempMessageId) {
            setMessages(prev => prev.map(m => 
              m._id === tempMessageId 
                ? { ...m, _id: response.messageId, status: 'delivered' as any }
                : m
            ));
          }
          
          // Remove from pending messages
          setPendingMessages(prev => {
            const newMap = new Map(prev);
            newMap.delete(tempMessageId);
            return newMap;
          });
          
          // Update conversations list only after server confirmation
          setConversations(prev => prev.map(conv => {
            if (conv._id === finalConversationId || (!finalConversationId && conv.participants.some(p => p._id === receiver))) {
              return {
                ...conv,
                lastMessage: {
                  text: text,
                  sender: user._id,
                  createdAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
              };
            }
            return conv;
          }));
        }
      });

    } catch (error) {
      setError('Failed to send message');
      toastManager.showError('Failed to send message');
    }
  }, [socket, user, activeConversation]);

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string) => {
    const pendingMessage = pendingMessages.get(messageId);
    if (!pendingMessage || !socket || !user) return;

    try {
      const messageData = {
        conversationId: pendingMessage.conversationId || undefined,
        receiver: pendingMessage.receiver,
        text: pendingMessage.text,
      };

      // Mark as sending
      setMessages(prev => prev.map(m => 
        m._id === messageId 
          ? { ...m, status: 'sent' as any }
          : m
      ));

      socket.emit('sendMessage', messageData, (response: any) => {
        if (!response.success) {
          // Mark as failed again
          setMessages(prev => prev.map(m => 
            m._id === messageId 
              ? { ...m, status: 'failed' as any }
              : m
          ));
          toastManager.showError(response.error || 'Failed to retry message');
        } else {
          // Update with real ID and mark as delivered
          setMessages(prev => prev.map(m => 
            m._id === messageId 
              ? { ...m, _id: response.messageId, status: 'delivered' as any }
              : m
          ));
          
          // Remove from pending
          setPendingMessages(prev => {
            const newMap = new Map(prev);
            newMap.delete(messageId);
            return newMap;
          });
        }
      });
    } catch (error) {
      toastManager.showError('Failed to retry message');
    }
  }, [socket, user, pendingMessages]);

  // Mark message as seen
  const markMessageSeen = useCallback(async (messageId: string) => {
    if (!socket || !activeConversation) return;

    try {
      socket.emit('messageSeen', {
        messageId,
        conversationId: activeConversation._id,
      }, (response: any) => {
        if (!response.success) {
          // Handle error silently
        }
      });
    } catch (error) {
      // Handle error silently
    }
  }, [socket, activeConversation]);

  // Open conversation with another user
  const openConversation = useCallback(async (otherUserId: string) => {
    if (!socket || !user) return;

    console.log('🔍 ChatContext - Opening conversation with user:', otherUserId);

    try {
      socket.emit('openConversation', { otherUserId }, (response: any) => {
        if (response.success) {
          const { conversation, messages } = response;
          
          console.log('✅ ChatContext - Conversation opened successfully:', {
            conversationId: conversation._id,
            messagesCount: messages?.length || 0
          });
          
          // Update conversations list
          setConversations(prev => {
            const existingIndex = prev.findIndex(conv => conv._id === conversation._id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = conversation;
              return updated;
            } else {
              return [conversation, ...prev];
            }
          });

          // Set as active conversation
          setActiveConversation(conversation);
          setMessages(messages || []);

          // Join the conversation room
          socket.emit('joinConversation', { conversationId: conversation._id });
        } else {
          console.error('❌ ChatContext - Failed to open conversation:', response.error);
          setError(response.error || 'Failed to open conversation');
          toastManager.showError(response.error || 'Không thể mở cuộc trò chuyện');
        }
      });
    } catch (error) {
      console.error('❌ ChatContext - Error opening conversation:', error);
      setError('Failed to open conversation');
      toastManager.showError('Không thể mở cuộc trò chuyện');
    }
  }, [socket, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages
    const handleReceiveMessage = (message: Message) => {
      // Add message to current messages if it's for active conversation (normalize IDs)
      const isForActiveConversation = activeConversation && String(message.conversationId) === String(activeConversation._id);
      if (isForActiveConversation) {
        setMessages(prev => {
          // Enhanced duplicate checking
          const isDuplicate = prev.some(m => 
            m._id === message._id || 
            (m.text === message.text && 
             m.sender === message.sender && 
             Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
          );
          if (isDuplicate) return prev;
          
          // Update status to delivered for received messages
          const updatedMessage = { ...message, status: 'delivered' as any };
          const newMessages = [...prev, updatedMessage];
          
          // Update cache
          if (activeConversation?._id) {
            setMessageCache(prevCache => new Map(prevCache).set(activeConversation._id, newMessages));
          }
          
          return newMessages;
        });
      }

      // Update conversations list with new last message
      setConversations(prev => prev.map(conv => {
        if (String(conv._id) === String(message.conversationId)) {
          return {
            ...conv,
            lastMessage: {
              text: message.text || '',
              sender: message.sender,
              createdAt: message.createdAt,
            },
            updatedAt: message.createdAt,
            unread: {
              ...conv.unread,
              [message.receiver]: ((conv.unread || {})[message.receiver] || 0) + 1,
            },
          };
        }
        return conv;
      }));

      // Show notification for new message (if not from current user)
      const senderId = (typeof message.sender === 'object' && message.sender !== null)
        ? (message.sender as any)._id
        : (message.sender as unknown as string);

      if (senderId !== user?._id) {
        // Prefer sender.full_name if populated
        let senderName: string | undefined;
        if (typeof message.sender === 'object' && message.sender !== null && (message.sender as any).full_name) {
          senderName = (message.sender as any).full_name as string;
        }

        // Fallback: find in conversations by conversationId and match participant id
        if (!senderName) {
          const conv = conversations.find(c => c._id === message.conversationId);
          const matched = conv?.participants?.find(p => String(p._id) === String(senderId));
          senderName = matched?.full_name;
        }

        // Final fallback: show partner name if not matched
        if (!senderName) {
          const conv = conversations.find(c => c._id === message.conversationId);
          const partner = conv?.participants?.find(p => String(p._id) !== String(user?._id));
          senderName = partner?.full_name;
        }

        // Show toast notification for new message
        toastManager.showInfo(`Tin nhắn mới từ ${senderName || 'Người dùng'}`, {
          description: message.text?.length > 50 ? `${message.text.substring(0, 50)}...` : message.text,
          duration: 4000,
          action: {
            label: 'Xem tin nhắn',
            onClick: () => {
              // Navigate to profile chat tab with the conversation
              if (typeof window !== 'undefined') {
                window.location.href = `/chat?conversationId=${message.conversationId}`;
              }
            }
          }
        });
      }
    };

    // Listen for message seen status
    const handleMessageSeen = (data: { messageId: string; userId: string; status: string }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, status: data.status as any } : msg
      ));
      
      // Also update conversation's last message status if it matches
      setConversations(prev => prev.map(conv => {
        if (conv.lastMessage && conv.lastMessage.sender === data.userId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              status: data.status
            }
          };
        }
        return conv;
      }));
    };

    // Listen for conversation updates
    const handleConversationUpdated = (conversation: Conversation) => {
      setConversations(prev => prev.map(conv => 
        conv._id === conversation._id ? conversation : conv
      ));
    };

    // Listen for user online status
    const handleUserOnline = (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    // Listen for typing status
    const handleTypingStart = (data: { userId: string; userName: string; conversationId: string }) => {
      // Only show typing for current conversation
      if (activeConversation && data.conversationId === activeConversation._id && data.userId !== user?._id) {
        setTypingUsers(prev => new Map(prev).set(data.userId, data.userName));
      }
    };

    const handleTypingStop = (data: { userId: string; conversationId: string }) => {
      if (activeConversation && data.conversationId === activeConversation._id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    };

    // Register event listeners
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSeen', handleMessageSeen);
    socket.on('conversationUpdated', handleConversationUpdated);
    socket.on('userOnline', handleUserOnline);
    socket.on('typingStart', handleTypingStart);
    socket.on('typingStop', handleTypingStop);

    // Cleanup
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSeen', handleMessageSeen);
      socket.off('conversationUpdated', handleConversationUpdated);
      socket.off('userOnline', handleUserOnline);
      socket.off('typingStart', handleTypingStart);
      socket.off('typingStop', handleTypingStop);
    };
  }, [socket, isConnected, activeConversation?._id, user?._id]);

  // Load conversations when user changes
  useEffect(() => {
    if (user && isConnected) {
      loadConversations();
    }
  }, [user, isConnected, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      console.log('🔄 Active conversation changed, loading messages for:', activeConversation._id);
      loadMessages(activeConversation._id);
    } else {
      console.log('🔄 No active conversation, clearing messages');
      setMessages([]);
    }
  }, [activeConversation?._id, loadMessages]); // Use _id for more precise dependency

  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, conv) => {
    const unreadForUser = conv.unread?.[user?._id || ''] || 0;
    return sum + unreadForUser;
  }, 0);

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    totalUnread,
    onlineUsers,
    typingUsers,
    pendingMessages,
    loadConversations,
    loadMessages,
    sendMessage,
    markMessageSeen,
    openConversation,
    setActiveConversation: setActiveConversationEnhanced,
    addConversation,
    clearError,
    retryMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
