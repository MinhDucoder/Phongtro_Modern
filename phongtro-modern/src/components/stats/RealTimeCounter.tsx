'use client';

import { useState, useEffect } from 'react';
import { statsApi } from '@/lib/api';
import { 
  WifiIcon,
  EyeIcon,
  HomeIcon,
  UserIcon,
  ClockIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface RealTimeData {
  onlineUsers: number;
  postsLastHour: number;
  postsLastDay: number;
  viewsLastHour: number;
  viewsLastDay: number;
  timestamp: string;
}

export default function RealTimeCounter() {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    fetchRealTimeData();
    // Auto-refresh mỗi 30 giây
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRealTimeData = async () => {
    try {
      setLoading(true);
      const response = await statsApi.getRealTime();
      
      if (response.success) {
        setData(response.data);
        setLastUpdate(new Date());
        setIsConnected(true);
      } else {
        setError('Không thể tải dữ liệu real-time');
        setIsConnected(false);
      }
    } catch (err) {
      setError('Lỗi kết nối');
      setIsConnected(false);
      console.error('Error fetching real-time data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <WifiIcon className="h-4 w-4 text-gray-600 mr-2" />
            <h4 className="text-sm font-medium text-gray-900">
              Thống kê real-time
            </h4>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-3 w-3 mr-1" />
            {lastUpdate && formatTimeAgo(lastUpdate)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className="text-center py-4">
            <div className="text-red-500 text-sm">{error}</div>
            <button 
              onClick={fetchRealTimeData}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Online Users */}
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                <UserIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data ? formatNumber(data.onlineUsers) : '--'}
              </div>
              <div className="text-xs text-gray-600">Đang online</div>
            </div>

            {/* Posts Last Hour */}
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                <HomeIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data ? formatNumber(data.postsLastHour) : '--'}
              </div>
              <div className="text-xs text-gray-600">Tin/giờ</div>
            </div>

            {/* Views Last Hour */}
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
                <EyeIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data ? formatNumber(data.viewsLastHour) : '--'}
              </div>
              <div className="text-xs text-gray-600">Lượt xem/giờ</div>
            </div>

            {/* Posts Last Day */}
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
                <SignalIcon className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data ? formatNumber(data.postsLastDay) : '--'}
              </div>
              <div className="text-xs text-gray-600">Tin/ngày</div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Kết nối ổn định' : 'Mất kết nối'}
            {loading && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


