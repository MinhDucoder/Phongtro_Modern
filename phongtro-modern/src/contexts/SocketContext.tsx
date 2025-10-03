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
    console.log('🔌 SocketContext useEffect triggered:', {
      user: user ? { id: user._id, name: user.full_name } : null,
      socketExists: !!socket,
      isConnected
    });
    
    if (!user) {
      console.log('❌ No user found, disconnecting socket');
      // Disconnect socket if no user
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
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

    console.log('Creating socket connection with token:', token ? 'Present' : 'Missing');

    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ SocketContext - Socket connected successfully:', newSocket.id);
      console.log('Socket transport:', newSocket.io.engine.transport.name);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ SocketContext - Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      setConnectionError(error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
    };
  }, [user]);

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