'use client';

import { useState, useEffect } from 'react';
import { checkBackendHealth } from '@/lib/test-connection';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      const result = await checkBackendHealth();
      setIsConnected(result.status);
      setMessage(result.message);
    };

    testConnection();
    
    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span>Đang kiểm tra kết nối...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg text-sm shadow-lg ${
      isConnected 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="font-medium">
          {isConnected ? 'Kết nối OK' : 'Mất kết nối'}
        </span>
      </div>
      <div className="text-xs mt-1 opacity-75">
        {message}
      </div>
    </div>
  );
}
