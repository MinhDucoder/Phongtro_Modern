'use client';

import { useState, useEffect } from 'react';
import { statsApi } from '@/lib/api';
import { 
  HomeIcon, 
  UserIcon, 
  EyeIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface StatsData {
  totalPosts: number;
  totalUsers: number;
  totalRooms: number;
  activePosts: number;
  newPostsToday: number;
  totalViews: number;
  lastUpdated: string;
}

interface RealTimeData {
  onlineUsers: number;
  postsLastHour: number;
  postsLastDay: number;
  viewsLastHour: number;
  viewsLastDay: number;
  timestamp: string;
}

export default function StatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    // Auto-refresh mỗi 30 giây
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING STATS ===');
      console.log('Current time:', new Date().toISOString());
      
      // Test direct fetch first
      console.log('Testing direct fetch...');
      const directResponse = await fetch('http://localhost:5000/api/v1/stats/overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Direct fetch status:', directResponse.status);
      console.log('Direct fetch headers:', Object.fromEntries(directResponse.headers.entries()));
      
      if (!directResponse.ok) {
        throw new Error(`Direct fetch failed: ${directResponse.status}`);
      }
      
      const directData = await directResponse.json();
      console.log('Direct fetch data:', directData);
      
      // Now test statsApi
      console.log('Testing statsApi...');
      const [overviewResponse, realTimeResponse] = await Promise.all([
        statsApi.getOverview(),
        statsApi.getRealTime()
      ]);

      console.log('Overview response:', overviewResponse);
      console.log('Real-time response:', realTimeResponse);

      if (overviewResponse.success) {
        setStats(overviewResponse.data);
        console.log('✅ Stats set successfully');
      } else {
        console.error('❌ Overview API failed:', overviewResponse);
        setError('Không thể tải thống kê tổng quan');
      }

      if (realTimeResponse.success) {
        setRealTimeStats(realTimeResponse.data);
        console.log('✅ Real-time stats set successfully');
      } else {
        console.error('❌ Real-time API failed:', realTimeResponse);
        // Không set error cho real-time vì nó không quan trọng bằng overview
      }
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack'
      });
      setError(err instanceof Error ? err.message : 'Không thể tải thống kê');
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Thống kê tổng quan
            </h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {stats?.lastUpdated && formatTimeAgo(stats.lastUpdated)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Tổng số tin đăng */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats ? formatNumber(stats.totalPosts) : '--'}
            </div>
            <div className="text-sm text-gray-600">Tin đăng</div>
            {realTimeStats && (
              <div className="text-xs text-green-600 mt-1">
                +{realTimeStats.postsLastHour} trong giờ qua
              </div>
            )}
          </div>

          {/* Tổng số người dùng */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats ? formatNumber(stats.totalUsers) : '--'}
            </div>
            <div className="text-sm text-gray-600">Người dùng</div>
            {realTimeStats && (
              <div className="text-xs text-blue-600 mt-1">
                {realTimeStats.onlineUsers} đang online
              </div>
            )}
          </div>

          {/* Tổng lượt xem */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <EyeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats ? formatNumber(stats.totalViews) : '--'}
            </div>
            <div className="text-sm text-gray-600">Lượt xem</div>
            {realTimeStats && (
              <div className="text-xs text-purple-600 mt-1">
                +{realTimeStats.viewsLastHour} trong giờ qua
              </div>
            )}
          </div>

          {/* Tin mới hôm nay */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats ? formatNumber(stats.newPostsToday) : '--'}
            </div>
            <div className="text-sm text-gray-600">Tin mới hôm nay</div>
            {realTimeStats && (
              <div className="text-xs text-orange-600 mt-1">
                +{realTimeStats.postsLastDay} trong 24h
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        {stats && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(stats.activePosts)}
                </div>
                <div className="text-sm text-gray-600">Tin đang hoạt động</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(stats.totalRooms)}
                </div>
                <div className="text-sm text-gray-600">Tổng số phòng</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.totalPosts > 0 ? Math.round((stats.activePosts / stats.totalPosts) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ tin hoạt động</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
