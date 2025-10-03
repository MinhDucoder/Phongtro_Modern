'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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

    // Get token safely
    let token = null;
    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (storedTokens) {
        const tokenData = JSON.parse(storedTokens);
        token = tokenData.accessToken;
      }
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }

    if (!token) {
      console.warn('⚠️ No auth token found, skipping socket connection');
      return;
    }

    console.log('🔌 Creating socket connection for user:', user.full_name);

    // Create socket connection with error handling
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error (will retry):', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
      // Don't spam console with full error details
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed after all attempts');
      setConnectionError('Cannot connect to server');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('reconnect_failed');
      newSocket.disconnect();
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