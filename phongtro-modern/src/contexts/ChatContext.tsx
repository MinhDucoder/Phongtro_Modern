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
  
  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (text: string, conversationId?: string, receiver?: string) => Promise<void>;
  markMessageSeen: (messageId: string) => Promise<void>;
  openConversation: (otherUserId: string) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  clearError: () => void;
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

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await messageApi.getMessages(conversationId, { limit: 50 });
      
      if (response.success) {
        // Backend returns { success: true, items, total } directly
        const messages = response.data?.items || response.items || [];
        setMessages(messages);
      } else {
        setError(response.message || 'Failed to load messages');
      }
    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    // ConversationId is optional - if not provided, backend will create/find conversation
    // if (!conversationId || !conversationId.trim()) {
    //   toastManager.showError('Conversation ID is required');
    //   return;
    // }

    try {
      const messageData = {
        conversationId: conversationId ? conversationId.trim() : undefined,
        receiver: receiver.trim(),
        text: text.trim(),
      };

      console.log('📤 ChatContext - Sending message with data:', messageData);
      console.log('Socket connected:', socket.connected);
      console.log('Socket ID:', socket.id);

      // Use socket to send message
      socket.emit('sendMessage', messageData, (response: any) => {
        if (!response.success) {
          setError(response.error || 'Failed to send message');
          toastManager.showError(response.error || 'Failed to send message');
        } else {
          // Join conversation room if not already joined
          const finalConversationId = response.conversationId || conversationId;
          if (finalConversationId) {
            socket.emit('joinConversation', { conversationId: finalConversationId });
          }
          
          // Add message to UI immediately for better UX
          const tempMessage: Message = {
            _id: response.messageId || `temp_${Date.now()}`,
            conversationId: finalConversationId || '',
            sender: user._id,
            receiver: receiver,
            text: text,
            status: 'sent',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Add to messages if it's for active conversation
          if (activeConversation && (conversationId === activeConversation._id || !conversationId)) {
            setMessages(prev => {
              // Check if message already exists
              if (prev.some(m => m._id === tempMessage._id)) return prev;
              return [...prev, tempMessage];
            });
          }
          
          // Update conversations list
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
  }, [socket, user]);

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

    try {
      socket.emit('openConversation', { otherUserId }, (response: any) => {
        if (response.success) {
          const { conversation, messages } = response;
          
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
          setError(response.error || 'Failed to open conversation');
        }
      });
    } catch (error) {
      console.error('Error opening conversation:', error);
      setError('Failed to open conversation');
    }
  }, [socket, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages
    const handleReceiveMessage = (message: Message) => {
      // Add message to current messages if it's for active conversation
      if (activeConversation && message.conversationId === activeConversation._id) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update conversations list with new last message
      setConversations(prev => prev.map(conv => {
        if (conv._id === message.conversationId) {
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
              [message.receiver]: (conv.unread[message.receiver] || 0) + 1,
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
                window.location.href = `/profile?tab=chat&conversationId=${message.conversationId}`;
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
    };

    // Listen for conversation updates
    const handleConversationUpdated = (conversation: Conversation) => {
      setConversations(prev => prev.map(conv => 
        conv._id === conversation._id ? conversation : conv
      ));
    };

    // Register event listeners
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSeen', handleMessageSeen);
    socket.on('conversationUpdated', handleConversationUpdated);

    // Cleanup
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSeen', handleMessageSeen);
      socket.off('conversationUpdated', handleConversationUpdated);
    };
  }, [socket, isConnected, activeConversation, user]);

  // Load conversations when user changes
  useEffect(() => {
    if (user && isConnected) {
      loadConversations();
    }
  }, [user, isConnected, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation._id);
    } else {
      setMessages([]);
    }
  }, [activeConversation, loadMessages]);

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
    loadConversations,
    loadMessages,
    sendMessage,
    markMessageSeen,
    openConversation,
    setActiveConversation,
    addConversation,
    clearError,
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
