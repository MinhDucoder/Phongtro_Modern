'use client';

import { useState, useEffect } from 'react';
import {
  EyeIcon,
  HeartIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface PropertyAnalyticsProps {
  propertyId: string;
  isOwner?: boolean;
  analytics?: {
    views: number;
    likes: number;
    calls: number;
    messages: number;
    saves: number;
    priceHistory?: Array<{
      date: string;
      price: number;
    }>;
    viewHistory?: Array<{
      date: string;
      views: number;
    }>;
    competitorAnalysis?: {
      avgPrice: number;
      avgViews: number;
      marketTrend: 'up' | 'down' | 'stable';
    };
  };
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalCalls: number;
  totalMessages: number;
  totalSaves: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  priceHistory: Array<{ date: string; price: number }>;
  viewHistory: Array<{ date: string; views: number }>;
  competitorAnalysis: {
    avgPrice: number;
    avgViews: number;
    marketTrend: 'up' | 'down' | 'stable';
  };
  recentActivity: Array<{
    type: 'view' | 'like' | 'call' | 'message' | 'save';
    timestamp: string;
    userAgent?: string;
  }>;
}

export default function PropertyAnalytics({ propertyId, isOwner = false, analytics }: PropertyAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
        
        // Mock data - replace with actual API call
        const mockData: AnalyticsData = {
          totalViews: analytics?.views || 1247,
          totalLikes: analytics?.likes || 89,
          totalCalls: analytics?.calls || 23,
          totalMessages: analytics?.messages || 45,
          totalSaves: 156,
          viewsToday: 23,
          viewsThisWeek: 156,
          viewsThisMonth: 634,
          priceHistory: [
            { date: '2024-01-01', price: 3500000 },
            { date: '2024-02-01', price: 3600000 },
            { date: '2024-03-01', price: 3500000 },
            { date: '2024-04-01', price: 3400000 },
            { date: '2024-05-01', price: 3300000 },
            { date: '2024-06-01', price: 3200000 },
          ],
          viewHistory: [
            { date: '2024-05-01', views: 45 },
            { date: '2024-05-02', views: 52 },
            { date: '2024-05-03', views: 38 },
            { date: '2024-05-04', views: 67 },
            { date: '2024-05-05', views: 43 },
            { date: '2024-05-06', views: 59 },
            { date: '2024-05-07', views: 71 },
          ],
          competitorAnalysis: {
            avgPrice: 3100000,
            avgViews: 89,
            marketTrend: 'down'
          },
          recentActivity: [
            { type: 'view', timestamp: '2024-05-07T10:30:00Z' },
            { type: 'like', timestamp: '2024-05-07T09:15:00Z' },
            { type: 'message', timestamp: '2024-05-07T08:45:00Z' },
            { type: 'call', timestamp: '2024-05-06T16:20:00Z' },
            { type: 'save', timestamp: '2024-05-06T14:10:00Z' },
          ]
        };

        setData(mockData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchAnalytics();
  }, [propertyId, timeRange]);

  if (!isOwner) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thống kê chi tiết</h3>
          <p className="text-gray-600 mb-4">Chỉ chủ nhà mới có thể xem thống kê chi tiết</p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data?.totalViews || 0}</div>
              <div className="text-gray-600">Lượt xem</div>
          </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data?.totalLikes || 0}</div>
              <div className="text-gray-600">Yêu thích</div>
        </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data?.totalCalls || 0}</div>
              <div className="text-gray-600">Cuộc gọi</div>
            </div>
        </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Không có dữ liệu thống kê</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <EyeIcon className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <HeartIcon className="w-4 h-4 text-red-500" />;
      case 'call':
        return <PhoneIcon className="w-4 h-4 text-green-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="w-4 h-4 text-purple-500" />;
      case 'save':
        return <HeartIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'view':
        return 'đã xem';
      case 'like':
        return 'đã thích';
      case 'call':
        return 'đã gọi';
      case 'message':
        return 'đã nhắn tin';
      case 'save':
        return 'đã lưu';
      default:
        return 'đã tương tác';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-3 text-blue-600" />
            Thống kê chi tiết
          </h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(data.totalViews)}</p>
      </div>
            <EyeIcon className="w-8 h-8 text-blue-500" />
                    </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{data.viewsToday}</span>
            <span className="text-gray-500 ml-1">hôm nay</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yêu thích</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(data.totalLikes)}</p>
                  </div>
            <HeartIcon className="w-8 h-8 text-red-500" />
                  </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{data.totalSaves}</span>
            <span className="text-gray-500 ml-1">đã lưu</span>
        </div>
      </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
                        <div>
              <p className="text-sm font-medium text-gray-600">Cuộc gọi</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(data.totalCalls)}</p>
            </div>
            <PhoneIcon className="w-8 h-8 text-green-500" />
        </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-blue-600 font-medium">{((data.totalCalls / data.totalViews) * 100).toFixed(1)}%</span>
            <span className="text-gray-500 ml-1">tỷ lệ gọi</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tin nhắn</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(data.totalMessages)}</p>
                  </div>
            <ChatBubbleLeftIcon className="w-8 h-8 text-purple-500" />
                    </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-blue-600 font-medium">{((data.totalMessages / data.totalViews) * 100).toFixed(1)}%</span>
            <span className="text-gray-500 ml-1">tỷ lệ nhắn tin</span>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600" />
          Phân tích thị trường
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Giá trung bình khu vực</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(data.competitorAnalysis.avgPrice)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Lượt xem trung bình</p>
            <p className="text-xl font-bold text-gray-900">{formatNumber(data.competitorAnalysis.avgViews)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Xu hướng thị trường</p>
            <div className="flex items-center justify-center">
              {getTrendIcon(data.competitorAnalysis.marketTrend)}
              <span className="ml-2 font-medium capitalize">
                {data.competitorAnalysis.marketTrend === 'up' ? 'Tăng' : 
                 data.competitorAnalysis.marketTrend === 'down' ? 'Giảm' : 'Ổn định'}
              </span>
            </div>
              </div>
            </div>
              </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
          Hoạt động gần đây
        </h3>
        <div className="space-y-3">
          {data.recentActivity.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {getActivityIcon(activity.type)}
                <span className="ml-3 text-gray-700">
                  Ai đó {getActivityText(activity.type)} tin đăng
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Gợi ý tối ưu</h3>
        <div className="space-y-2 text-blue-800">
          <p>• Tỷ lệ chuyển đổi từ xem sang gọi: {((data.totalCalls / data.totalViews) * 100).toFixed(1)}%</p>
          <p>• Tỷ lệ chuyển đổi từ xem sang nhắn tin: {((data.totalMessages / data.totalViews) * 100).toFixed(1)}%</p>
          {data.competitorAnalysis.marketTrend === 'down' && (
            <p>• Thị trường đang giảm giá, hãy cân nhắc điều chỉnh giá cho phù hợp</p>
          )}
          <p>• Cập nhật hình ảnh và mô tả thường xuyên để tăng lượt tương tác</p>
        </div>
      </div>
    </div>
  );
}