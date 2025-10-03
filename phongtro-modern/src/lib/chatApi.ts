// Chat API functions for backend communication
import { apiRequest } from './api';

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    full_name: string;
    avatar?: string;
    role: string;
  }>;
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  type: 'private' | 'group';
  unread: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string | { _id: string; full_name: string; avatar?: string; role: string };
  receiver: string;
  text?: string;
  attachments?: Array<{
    url: string;
    public_id?: string;
  }>;
  status: 'sent' | 'delivered' | 'seen';
  createdAt: string;
  updatedAt: string;
}

export interface ChatApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Conversation API functions
export const conversationApi = {
  // Get all conversations for current user
  async getConversations(params?: {
    page?: number;
    limit?: number;
  }): Promise<ChatApiResponse<{ items: Conversation[]; total: number }>> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/conversations${queryString}`, {
      method: 'GET',
    });
  },

  // Create or get existing conversation
  async createConversation(participants: string[]): Promise<ChatApiResponse<Conversation>> {
    return apiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({ participants }),
    });
  },

  // Get conversation by ID
  async getConversationById(conversationId: string): Promise<ChatApiResponse<Conversation>> {
    return apiRequest(`/conversations/${conversationId}`, {
      method: 'GET',
    });
  },
};

// Message API functions
export const messageApi = {
  // Get messages in a conversation
  async getMessages(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ChatApiResponse<{ items: Message[]; total: number }>> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/messages/${conversationId}${queryString}`, {
      method: 'GET',
    });
  },

  // Send message (backup for socket)
  async sendMessage(messageData: {
    conversationId?: string;
    receiver: string;
    text?: string;
    attachments?: Array<{
      url: string;
      public_id?: string;
    }>;
  }): Promise<ChatApiResponse<Message>> {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Mark message as seen
  async markMessageSeen(messageId: string): Promise<ChatApiResponse<Message>> {
    return apiRequest(`/messages/${messageId}/seen`, {
      method: 'PATCH',
    });
  },
};

// Socket event types for type safety
export interface SocketEvents {
  // Client to server events
  joinConversation: (data: { conversationId: string }, callback?: (response: any) => void) => void;
  openConversation: (data: { otherUserId: string }, callback?: (response: any) => void) => void;
  sendMessage: (data: {
    conversationId?: string;
    receiver: string;
    text?: string;
    attachments?: Array<{
      url: string;
      public_id?: string;
    }>;
  }, callback?: (response: any) => void) => void;
  messageSeen: (data: { messageId: string; conversationId: string }, callback?: (response: any) => void) => void;

  // Server to client events
  receiveMessage: (message: Message) => void;
  messageSeen: (data: { messageId: string; userId: string; status: string }) => void;
  conversationUpdated: (conversation: Conversation) => void;
  userOnline: (data: { userId: string; isOnline: boolean }) => void;
}

// Helper functions for chat operations
export const chatHelpers = {
  // Find or create conversation between two users
  async findOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
    try {
      // First try to find existing conversation
      const conversationsResponse = await conversationApi.getConversations();
      if (conversationsResponse.success && conversationsResponse.data) {
        const existingConversation = conversationsResponse.data.items.find(conv => 
          conv.participants.length === 2 &&
          conv.participants.some(p => p._id === userId1) &&
          conv.participants.some(p => p._id === userId2)
        );
        
        if (existingConversation) {
          return existingConversation;
        }
      }

      // Create new conversation if not found
      const createResponse = await conversationApi.createConversation([userId1, userId2]);
      if (createResponse.success && createResponse.data) {
        return createResponse.data;
      }
      
      throw new Error('Failed to create conversation');
    } catch (error) {
      console.error('Error finding or creating conversation:', error);
      throw error;
    }
  },

  // Get conversation partner info
  getConversationPartner(conversation: Conversation, currentUserId: string) {
    const partner = conversation.participants.find(p => p._id !== currentUserId);
    // Ensure partner has required fields
    if (partner) {
      return {
        ...partner,
        full_name: partner.full_name || 'Unknown User',
        avatar: partner.avatar || '/placeholder-room.svg',
        role: partner.role || 'user'
      };
    }
    return undefined;
  },

  // Format message timestamp
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)} giờ`;
    if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))} ngày`;
    
    return date.toLocaleDateString('vi-VN');
  },

  // Check if message is from current user
  isMessageFromCurrentUser(message: Message, currentUserId: string): boolean {
    // Handle both populated object and string ID
    const senderId = typeof message.sender === 'object' && message.sender !== null
      ? String(message.sender._id) // If it's a populated object, use its _id
      : String(message.sender);    // Otherwise, assume it's already the ID string

    const userIdStr = String(currentUserId);
    const isFromCurrentUser = senderId === userIdStr;
    
    // Debug logging
    if (typeof window !== 'undefined') {
      console.log('isMessageFromCurrentUser debug:', {
        messageSender: message.sender,
        currentUserId: currentUserId,
        senderId: senderId, // Log the actual ID being compared
        userIdStr: userIdStr,
        isFromCurrentUser: isFromCurrentUser,
        messageText: message.text
      });
    }
    
    return isFromCurrentUser;
  },

  // Get unread count for current user
  getUnreadCount(conversation: Conversation, currentUserId: string): number {
    return conversation.unread[currentUserId] || 0;
  },
};
