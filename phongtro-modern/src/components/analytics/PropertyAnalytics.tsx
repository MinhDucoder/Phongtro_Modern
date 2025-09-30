'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  EyeIcon,
  HeartIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '@/lib/api';
import { getFirstImage } from '@/lib/imageUtils';
import { toastManager } from '@/components/ui/ToastManager';

interface OverviewStats {
  totalViews: number;
  totalLikes: number;
  totalCalls: number;
  totalMessages: number;
  viewsChange?: string;
  likesChange?: string;
  callsChange?: string;
  messagesChange?: string;
}

interface DeviceStat {
  type: string;
  percentage: number;
  icon?: string;
}

interface LocationStat {
  city: string;
  percentage?: number;
  views?: number;
}

interface AgeGroupStat {
  range: string;
  percentage: number;
  label?: string;
}

interface TimeAnalytics {
  bestHours?: Array<{ hour: string; views: number }>;
  bestDays?: Array<{ day: string; views: number }>;
}

interface PostAnalytics {
  _id?: string;
  id?: string;
  title?: string;
  roomId?: any;
  views?: number;
  likes?: number;
  calls?: number;
  messages?: number;
  ctr?: number;
  revenue?: number;
  analytics?: {
    views?: number;
    likes?: number;
    calls?: number;
    messages?: number;
  };
}

interface DashboardAnalytics {
  overview?: OverviewStats;
  topPerformingPosts?: PostAnalytics[];
  demographics?: {
    ageGroups?: AgeGroupStat[];
    devices?: DeviceStat[];
    locations?: LocationStat[];
  };
  timeAnalytics?: TimeAnalytics;
  dailyStats?: Array<{ date: string; views: number; likes: number; calls: number; messages: number }>;
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className={`ml-2 text-sm font-medium ${
            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function PropertyAnalytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(null);
  const [availablePosts, setAvailablePosts] = useState<PostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeRanges = [
    { value: '24h', label: '24 giờ' },
    { value: '7d', label: '7 ngày' },
    { value: '30d', label: '30 ngày' },
    { value: '90d', label: '90 ngày' },
  ];

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getAnalytics({
        timeRange: selectedTimeRange,
        postId: selectedProperty === 'all' ? undefined : selectedProperty
      });

      if (!response || response.success === false) {
        const message = response?.message || 'Không thể tải dữ liệu analytics';
        setError(message);
        setAnalyticsData(null);
        toastManager.showError(message);
        return;
      }

      const data = response.data as DashboardAnalytics;
      if (!data) {
        setAnalyticsData(null);
        setError('Dữ liệu analytics trống.');
        return;
      }

      // Ensure nested arrays exist to avoid runtime errors
      const normalizedData: DashboardAnalytics = {
        overview: {
          totalViews: data.overview?.totalViews ?? 0,
          totalLikes: data.overview?.totalLikes ?? 0,
          totalCalls: data.overview?.totalCalls ?? 0,
          totalMessages: data.overview?.totalMessages ?? 0,
          viewsChange: data.overview?.viewsChange || '+0%',
          likesChange: data.overview?.likesChange || '+0%',
          callsChange: data.overview?.callsChange || '+0%',
          messagesChange: data.overview?.messagesChange || '+0%',
        },
        topPerformingPosts: (data.topPerformingPosts || []).map((post) => ({
          ...post,
          views: Number(post.views ?? post.analytics?.views ?? 0),
          likes: Number(post.likes ?? post.analytics?.likes ?? 0),
          calls: Number(post.calls ?? post.analytics?.calls ?? 0),
          messages: Number(post.messages ?? post.analytics?.messages ?? 0),
          ctr: Number(post.ctr ?? 0),
          revenue: Number(post.revenue ?? post.roomId?.price ?? 0),
        })),
        demographics: {
          ageGroups: (data.demographics?.ageGroups || []).map((group) => ({
            ...group,
            percentage: Number(group.percentage ?? 0),
          })),
          devices: (data.demographics?.devices || []).map((device) => ({
            ...device,
            percentage: Number(device.percentage ?? 0),
          })),
          locations: (data.demographics?.locations || []).map((location) => ({
            ...location,
            percentage: Number(location.percentage ?? 0),
            views: Number(location.views ?? 0),
          })),
        },
        timeAnalytics: {
          bestHours: (data.timeAnalytics?.bestHours || []).map((hour) => ({
            hour: hour.hour,
            views: Number(hour.views ?? 0),
          })),
          bestDays: (data.timeAnalytics?.bestDays || []).map((day) => ({
            day: day.day,
            views: Number(day.views ?? 0),
          })),
        },
        dailyStats: (data.dailyStats || []).map((stat) => ({
          date: stat.date,
          views: Number(stat.views ?? 0),
          likes: Number(stat.likes ?? 0),
          calls: Number(stat.calls ?? 0),
          messages: Number(stat.messages ?? 0),
        })),
      };

      const sortedPosts = [...(normalizedData.topPerformingPosts || [])]
        .sort((a, b) => (b.views || 0) - (a.views || 0));
      const sortedDevices = [...(normalizedData.demographics?.devices || [])]
        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

      setAnalyticsData({
        ...normalizedData,
        topPerformingPosts: sortedPosts,
        demographics: {
          ...normalizedData.demographics,
          devices: sortedDevices,
        },
      });
      setAvailablePosts(sortedPosts);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      const message = err?.message || 'Có lỗi xảy ra khi tải dữ liệu analytics';
      setError(message);
      setAnalyticsData(null);
      toastManager.showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange, selectedProperty]);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phân tích tin đăng</h1>
            <p className="mt-1 text-sm text-gray-500">
              Theo dõi hiệu quả và tối ưu hóa tin đăng của bạn
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-gray-300"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Đang tải dữ liệu analytics...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phân tích tin đăng</h1>
            <p className="mt-1 text-sm text-gray-500">
              Theo dõi hiệu quả và tối ưu hóa tin đăng của bạn
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={fetchAnalytics}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only show data if API call was successful
  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 011 1v2.126a7.002 7.002 0 015.874 5.873H18a1 1 0 110 2h-2.126A7.002 7.002 0 019 16.874V19a1 1 0 11-2 0v-2.126A7.002 7.002 0 011.126 11H-1a1 1 0 110-2h2.126A7.002 7.002 0 017 5.126V3a1 1 0 012-1z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu analytics</h3>
          <p className="text-gray-500 mb-4">Hãy đăng tin và thu hút lượt xem để thấy thống kê tại đây.</p>
          <button 
            onClick={() => fetchAnalytics()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Làm mới dữ liệu
          </button>
        </div>
      </div>
    );
  }

  const data = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích tin đăng</h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi hiệu quả và tối ưu hóa tin đăng của bạn
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả tin đăng</option>
            {availablePosts.map((property, index) => {
              const id = property.id || property._id || `property-${index}`;
              const label = property.title || property.roomId?.title || 'Tin đăng';
              return (
                <option key={id} value={id}>
                  {label?.length > 32 ? `${label.substring(0, 29)}...` : label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng lượt xem"
          value={data.overview?.totalViews?.toLocaleString() || '0'}
          change={data.overview?.viewsChange || '+0%'}
          icon={EyeIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Lượt yêu thích"
          value={data.overview?.totalLikes?.toString() || '0'}
          change={data.overview?.likesChange || '+0%'}
          icon={HeartIcon}
          color="bg-red-500"
        />
        <StatCard
          title="Cuộc gọi"
          value={data.overview?.totalCalls?.toString() || '0'}
          change={data.overview?.callsChange || '+0%'}
          icon={PhoneIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Tin nhắn"
          value={data.overview?.totalMessages?.toString() || '0'}
          change={data.overview?.messagesChange || '+0%'}
          icon={ChatBubbleLeftIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lượt xem theo thời gian</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
            {data.dailyStats && data.dailyStats.length > 0 ? (
              data.dailyStats
                .slice(-7)
                .map((day, index) => {
                  const totalViews = Math.max(...(data.dailyStats || []).map((stat) => stat.views || 0), 1);
                  const height = Math.max(((day.views || 0) / totalViews) * 100, 5);
                  return (
                    <div key={day.date || `day-${index}`} className="flex flex-col items-center">
                      <div
                        className="bg-blue-500 rounded-t w-8 mb-2"
                        style={{ height: `${height}%`, minHeight: '16px' }}
                      ></div>
                      <span className="text-xs text-gray-600">
                        {new Date(day.date).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                      <span className="text-xs font-medium text-gray-900">{(day.views || 0).toLocaleString()}</span>
                    </div>
                  );
                })
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thiết bị truy cập</h3>
          <div className="space-y-4">
            {(data.demographics?.devices || []).map((device: DeviceStat, index) => {
              const normalizeIcon = (iconName?: string) => {
                if (!iconName) return DevicePhoneMobileIcon;
                const lower = iconName.toLowerCase();
                if (lower.includes('desktop')) return ComputerDesktopIcon;
                if (lower.includes('tablet')) return GlobeAltIcon;
                return DevicePhoneMobileIcon;
              };

              const IconComponent = normalizeIcon(device.icon);
              const percentage = device.percentage ?? 0;
              
              return (
                <div key={device.type || `device-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IconComponent className="h-5 w-5 text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{device.type}</span>
                  </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performing Properties */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Tin đăng hiệu quả nhất</h3>
        </div>
        <div className="overflow-x-auto">
          {(data.topPerformingPosts?.length || 0) > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tin đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yêu thích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuộc gọi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(data.topPerformingPosts || []).map((property: any, index) => (
                  <tr key={property.id || property._id || `property-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image
                          src={getFirstImage(property.roomId?.images || property.images)}
                          alt={property.title || property.roomId?.title || 'Room image'}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {property.title || property.roomId?.title || 'Tin đăng'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {property.id || property._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {(property.views || property.analytics?.views || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-900">{property.likes || property.analytics?.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-900">{property.calls || property.analytics?.calls || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span                       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseFloat(property.ctr || 0) > 4 
                          ? 'bg-green-100 text-green-800' 
                          : parseFloat(property.ctr || 0) > 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(property.ctr || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {(property.revenue || property.roomId?.price || 0).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/phong-tro/${property.id || property._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có dữ liệu tin đăng</p>
            </div>
          )}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Demographics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Độ tuổi người xem</h3>
          <div className="space-y-4">
            {(data.demographics?.ageGroups?.length || 0) > 0 ? (
              (data.demographics?.ageGroups || []).map((group: any, index) => (
                <div key={group.range || `age-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{group.range} tuổi</span>
                    <span className="text-sm text-gray-500 ml-2">({group.label})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{group.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Chưa có dữ liệu độ tuổi</p>
              </div>
            )}
          </div>
        </div>

        {/* Location Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vị trí người xem</h3>
          <div className="space-y-4">
            {(data.demographics?.locations?.length || 0) > 0 ? (
              (data.demographics?.locations || []).map((location: any, index) => (
                <div key={location.city || `location-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{location.city}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{location.percentage}%</span>
                    <span className="text-xs text-gray-500 ml-2">({location.views})</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Chưa có dữ liệu vị trí</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Hours */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Giờ vàng (nhiều lượt xem nhất)</h3>
          <div className="space-y-3">
            {(() => {
              const bestHours = data.timeAnalytics?.bestHours && data.timeAnalytics.bestHours.length > 0
                ? data.timeAnalytics.bestHours
                : (data.dailyStats || [])
                    .map((stat) => ({ hour: stat.date, views: stat.views || 0 }))
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 4)
                    .map((item) => ({
                      hour: new Date(item.hour).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      views: item.views,
                    }));

              return bestHours && bestHours.length > 0 ? bestHours.map((hour, index) => (
                <div key={hour.hour || `hour-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{hour.hour}</span>
                  </div>
                  <span className="text-sm text-gray-600">{(hour.views || 0).toLocaleString()} lượt xem</span>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Chưa có dữ liệu giờ vàng</p>
                </div>
              );
            })()}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Gợi ý:</strong> Đăng tin mới vào 18:00-21:00 để có hiệu quả tốt nhất
            </p>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gợi ý cải thiện</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Thêm ảnh chất lượng cao</h4>
                <p className="text-sm text-gray-600">Tin có 5+ ảnh có CTR cao hơn 40%</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Cập nhật mô tả định kỳ</h4>
                <p className="text-sm text-gray-600">Refresh tin đăng để tăng độ ưu tiên</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Phản hồi tin nhắn nhanh</h4>
                <p className="text-sm text-gray-600">Thời gian phản hồi dưới 1h tăng conversion 25%</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Sử dụng gói VIP</h4>
                <p className="text-sm text-gray-600">Tin VIP có lượt xem gấp 3 lần tin thường</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Link
              href="/dashboard/tin-dang"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Đăng tin VIP
            </Link>
          </div>
        </div>
      </div>

      {/* Competitive Analysis */}
      {/* Export Options */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Xuất báo cáo</h4>
            <p className="text-sm text-gray-500">Tải báo cáo analytics chi tiết</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Xuất PDF
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
