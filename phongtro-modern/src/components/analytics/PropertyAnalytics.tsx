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

// Mock analytics data
const analyticsData = {
  overview: {
    totalViews: 2847,
    totalLikes: 89,
    totalCalls: 156,
    totalMessages: 23,
    viewsChange: '+12%',
    likesChange: '-2%',
    callsChange: '+8%',
    messagesChange: '+25%',
  },
  topPerformingPosts: [
    {
      id: '1',
      title: 'Phòng trọ gần ĐH Bách Khoa, full nội thất',
      image: '/placeholder-room.svg',
      views: 1234,
      likes: 45,
      calls: 67,
      messages: 12,
      revenue: 150000,
      ctr: 5.4, // Click-through rate
    },
    {
      id: '2',
      title: 'Căn hộ mini có ban công, view đẹp',
      image: '/placeholder-room.svg',
      views: 892,
      likes: 28,
      calls: 34,
      messages: 8,
      revenue: 100000,
      ctr: 3.8,
    },
    {
      id: '3',
      title: 'Nhà nguyên căn 2PN, có sân vườn',
      image: '/placeholder-room.svg',
      views: 567,
      likes: 12,
      calls: 23,
      messages: 3,
      revenue: 200000,
      ctr: 4.1,
    },
  ],
  demographics: {
    ageGroups: [
      { range: '18-25', percentage: 45, label: 'Sinh viên' },
      { range: '26-35', percentage: 30, label: 'Nhân viên trẻ' },
      { range: '36-45', percentage: 20, label: 'Gia đình trẻ' },
      { range: '45+', percentage: 5, label: 'Khác' },
    ],
    devices: [
      { type: 'Mobile', percentage: 65, icon: DevicePhoneMobileIcon },
      { type: 'Desktop', percentage: 30, icon: ComputerDesktopIcon },
      { type: 'Tablet', percentage: 5, icon: GlobeAltIcon },
    ],
    locations: [
      { city: 'Hà Nội', percentage: 60, views: 1708 },
      { city: 'TP.HCM', percentage: 25, views: 712 },
      { city: 'Đà Nẵng', percentage: 10, views: 285 },
      { city: 'Khác', percentage: 5, views: 142 },
    ],
  },
  timeAnalytics: {
    bestHours: [
      { hour: '9:00', views: 234 },
      { hour: '12:00', views: 189 },
      { hour: '18:00', views: 345 },
      { hour: '21:00', views: 278 },
    ],
    bestDays: [
      { day: 'Thứ 2', views: 456 },
      { day: 'Thứ 3', views: 398 },
      { day: 'Thứ 4', views: 423 },
      { day: 'Thứ 5', views: 445 },
      { day: 'Thứ 6', views: 389 },
      { day: 'Thứ 7', views: 298 },
      { day: 'CN', views: 234 },
    ],
  }
};

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
  const [analyticsData, setAnalyticsData] = useState<any>(null);
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

      if (response.success && response.data) {
        setAnalyticsData(response.data);
      } else {
        setError('Không thể tải dữ liệu analytics');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
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

  // Use fallback data if API data is not available
  const data = analyticsData || {
    overview: {
      totalViews: 0,
      totalLikes: 0,
      totalCalls: 0,
      totalMessages: 0,
      viewsChange: '+0%',
      likesChange: '+0%',
      callsChange: '+0%',
      messagesChange: '+0%',
    },
    topPerformingPosts: [],
    demographics: {
      ageGroups: [],
      devices: [
        { type: 'Mobile', percentage: 0, icon: DevicePhoneMobileIcon },
        { type: 'Desktop', percentage: 0, icon: ComputerDesktopIcon },
        { type: 'Tablet', percentage: 0, icon: GlobeAltIcon },
      ],
      locations: [],
    },
    timeAnalytics: {
      bestHours: [],
      bestDays: [],
    }
  };

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
            {data.topPerformingPosts?.map((property: any) => (
              <option key={property.id || property._id} value={property.id || property._id}>
                {(property.title || property.roomId?.title || 'Tin đăng').substring(0, 30)}...
              </option>
            ))}
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
            {data.timeAnalytics?.bestDays?.length > 0 ? (
              data.timeAnalytics.bestDays.map((day: any) => (
                <div key={day.day} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-8 mb-2"
                    style={{ height: `${(day.views / 500) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <span className="text-xs text-gray-600">{day.day}</span>
                  <span className="text-xs font-medium text-gray-900">{day.views}</span>
                </div>
              ))
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
            {data.demographics?.devices?.map((device: any) => {
              // Map icon string to actual component
              const getIconComponent = (iconName: string) => {
                switch (iconName) {
                  case 'DevicePhoneMobileIcon':
                    return DevicePhoneMobileIcon;
                  case 'ComputerDesktopIcon':
                    return ComputerDesktopIcon;
                  case 'GlobeAltIcon':
                    return GlobeAltIcon;
                  default:
                    return DevicePhoneMobileIcon;
                }
              };
              
              const IconComponent = getIconComponent(device.icon);
              
              return (
                <div key={device.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IconComponent className="h-5 w-5 text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{device.type}</span>
                  </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{device.percentage}%</span>
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
          {data.topPerformingPosts?.length > 0 ? (
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
                {data.topPerformingPosts.map((property: any) => (
                  <tr key={property.id || property._id} className="hover:bg-gray-50">
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
            {data.demographics?.ageGroups?.length > 0 ? (
              data.demographics.ageGroups.map((group: any) => (
                <div key={group.range} className="flex items-center justify-between">
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
            {data.demographics?.locations?.length > 0 ? (
              data.demographics.locations.map((location: any) => (
                <div key={location.city} className="flex items-center justify-between">
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
            {data.timeAnalytics?.bestHours?.length > 0 ? (
              data.timeAnalytics.bestHours.map((hour: any, index: number) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{hour.hour}</span>
                  </div>
                  <span className="text-sm text-gray-600">{hour.views} lượt xem</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Chưa có dữ liệu giờ vàng</p>
              </div>
            )}
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
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Phân tích cạnh tranh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">Top 20%</div>
            <div className="text-sm text-blue-600">Xếp hạng trong khu vực</div>
            <div className="text-xs text-gray-500 mt-1">So với 156 tin đăng tương tự</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">+15%</div>
            <div className="text-sm text-green-600">Cao hơn giá trung bình</div>
            <div className="text-xs text-gray-500 mt-1">Giá TB khu vực: 3.2 triệu</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">4.2/5</div>
            <div className="text-sm text-purple-600">Điểm chất lượng tin</div>
            <div className="text-xs text-gray-500 mt-1">Dựa trên ảnh, mô tả, phản hồi</div>
          </div>
        </div>
      </div>

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
