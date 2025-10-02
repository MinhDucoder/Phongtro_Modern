'use client';

import { useSocket } from '@/contexts/SocketContext';

export default function SocketStatusIndicator() {
  const { isConnected, connectionError } = useSocket();

  if (connectionError) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">Mất kết nối</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-green-500/50 shadow-lg"></div>
          <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        </div>
        <span className="text-xs font-medium">Trực tuyến</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-gray-500">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      <span className="text-xs font-medium">Đang kết nối...</span>
    </div>
  );
}
