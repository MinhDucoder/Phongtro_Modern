'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { authApi } from '@/lib/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Don't create socket if no user
    if (!user) {
      // Disconnect existing socket if user logged out
      if (socket) {
        console.log('❌ No user found, disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Don't create new socket if one already exists for this user
    if (socket && socket.connected) {
      console.log('✅ Socket already connected, reusing existing connection');
      return;
    }

    console.log('🔌 Creating socket connection for user:', user.full_name);

    // Create socket connection with error handling
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Socket connected:', newSocket.id);
      }
      setIsConnected(true);
      setConnectionError(null);
      
      // Emit user online status
      newSocket.emit('userOnline', (response: any) => {
        if (!response.success) {
          console.warn('Failed to set user online status');
        }
      });
    });

    newSocket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ Socket disconnected:', reason);
      }
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Socket connection error (will retry):', error.message);
      }
      setConnectionError(error.message);
      setIsConnected(false);
      // Don't spam console with full error details
    });

    newSocket.on('reconnect_failed', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Socket reconnection failed after all attempts');
      }
      setConnectionError('Cannot connect to server');
    });

    // Listen for notifications
    newSocket.on('notification', (notification) => {
      console.log('🔔 Socket received notification:', notification);
      console.log('🔔 Notification type:', notification.type);
      console.log('🔔 Notification title:', notification.title);
      console.log('🔔 Notification metadata:', notification.metadata);
      
      // Dispatch custom event for notification
      if (typeof window !== 'undefined') {
        console.log('🔔 Dispatching notification-received event');
        window.dispatchEvent(new CustomEvent('notification-received', {
          detail: notification
        }));
      }
    });

    setSocket(newSocket);

    // Định kỳ làm mới access token để cookie luôn hợp lệ cho Socket
    // 13 phút (dưới 15m) để làm mới trước khi hết hạn
    const refreshInterval = setInterval(async () => {
      try {
        await authApi.refreshToken();
        // Không cần xử lý gì thêm: cookie HttpOnly sẽ được cập nhật bởi server
      } catch {
        // Bỏ qua lỗi; lần kế tiếp sẽ thử lại
      }
    }, 13 * 60 * 1000);

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('reconnect_failed');
      newSocket.disconnect();
      clearInterval(refreshInterval);
    };
  }, [user?._id]); // Only depend on user ID, not the whole user object

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}