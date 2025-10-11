'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  HomeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalViews: number;
    totalPosts: number;
    totalUsers: number;
    averageRating?: number;
    conversionRate: number;
  };
  growth: {
    revenueGrowth: number;
    viewsGrowth: number;
    postsGrowth: number;
    usersGrowth: number;
  };
  postsByStatus: {
    active: number;
    pending: number;
    expired: number;
    rejected: number;
  };
  postsByCategory: {
    category: string;
    count: number;
  }[];
  topCities: {
    city: string;
    count: number;
    revenue: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    posts: number;
  }[];
  topLandlords: {
    _id: string;
    name: string;
    totalPosts: number;
    totalRevenue: number;
    averageRating?: number;
  }[];
  userActivity: {
    date: string;
    newUsers: number;
    activeUsers: number;
  }[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch analytics:', response.status);
        // Fallback to mock data if API fails
        setData(getMockAnalyticsData());
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        console.error('Error loading analytics data:', result.message);
        // Fallback to mock data if API fails
        setData(getMockAnalyticsData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to mock data if API fails
      setData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    overview: {
      totalRevenue: 245000000,
      totalViews: 1250000,
      totalPosts: 8543,
      totalUsers: 15234,
      averageRating: 4.5,
      conversionRate: 3.2
    },
    growth: {
      revenueGrowth: 15.3,
      viewsGrowth: 8.7,
      postsGrowth: 12.4,
      usersGrowth: 18.2
    },
    postsByStatus: {
      active: 6543,
      pending: 234,
      expired: 1543,
      rejected: 223
    },
    postsByCategory: [
      { category: 'Phòng trọ', count: 4532 },
      { category: 'Căn hộ', count: 2341 },
      { category: 'Nhà nguyên căn', count: 1234 },
      { category: 'Ở ghép', count: 436 }
    ],
    topCities: [
      { city: 'Hồ Chí Minh', count: 3456, revenue: 123000000 },
      { city: 'Hà Nội', count: 2341, revenue: 89000000 },
      { city: 'Đà Nẵng', count: 1234, revenue: 45000000 },
      { city: 'Cần Thơ', count: 876, revenue: 32000000 },
      { city: 'Hải Phòng', count: 654, revenue: 28000000 }
    ],
    revenueByMonth: [
      { month: 'Tháng 1', revenue: 18000000, posts: 654 },
      { month: 'Tháng 2', revenue: 19500000, posts: 678 },
      { month: 'Tháng 3', revenue: 21000000, posts: 712 },
      { month: 'Tháng 4', revenue: 22500000, posts: 745 },
      { month: 'Tháng 5', revenue: 24000000, posts: 789 },
      { month: 'Tháng 6', revenue: 25500000, posts: 823 }
    ],
    topLandlords: [
      { _id: '1', name: 'Nguyễn Văn A', totalPosts: 156, totalRevenue: 45000000, averageRating: 4.8 },
      { _id: '2', name: 'Trần Thị B', totalPosts: 134, totalRevenue: 38000000, averageRating: 4.7 },
      { _id: '3', name: 'Lê Văn C', totalPosts: 123, totalRevenue: 35000000, averageRating: 4.6 },
      { _id: '4', name: 'Phạm Thị D', totalPosts: 112, totalRevenue: 32000000, averageRating: 4.5 },
      { _id: '5', name: 'Hoàng Văn E', totalPosts: 98, totalRevenue: 28000000, averageRating: 4.4 }
    ],
    userActivity: [
      { date: '2024-01-01', newUsers: 234, activeUsers: 1234 },
      { date: '2024-01-02', newUsers: 256, activeUsers: 1345 },
      { date: '2024-01-03', newUsers: 243, activeUsers: 1298 },
      { date: '2024-01-04', newUsers: 267, activeUsers: 1423 },
      { date: '2024-01-05', newUsers: 289, activeUsers: 1512 }
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-600 mt-1">Tổng quan về hoạt động kinh doanh</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className={`flex items-center text-sm ${data.growth.revenueGrowth > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {data.growth.revenueGrowth > 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(data.growth.revenueGrowth)}
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90">Tổng doanh thu</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data.overview.totalRevenue)}</p>
        </div>

        {/* Total Views */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <EyeIcon className="h-6 w-6" />
            </div>
            <div className={`flex items-center text-sm ${data.growth.viewsGrowth > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {data.growth.viewsGrowth > 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(data.growth.viewsGrowth)}
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90">Lượt xem</h3>
          <p className="text-3xl font-bold mt-2">{formatNumber(data.overview.totalViews)}</p>
        </div>

        {/* Total Posts */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className={`flex items-center text-sm ${data.growth.postsGrowth > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {data.growth.postsGrowth > 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(data.growth.postsGrowth)}
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90">Bài đăng</h3>
          <p className="text-3xl font-bold mt-2">{formatNumber(data.overview.totalPosts)}</p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className={`flex items-center text-sm ${data.growth.usersGrowth > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {data.growth.usersGrowth > 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(data.growth.usersGrowth)}
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90">Người dùng</h3>
          <p className="text-3xl font-bold mt-2">{formatNumber(data.overview.totalUsers)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <div className="space-y-3">
            {data.revenueByMonth.map((item, index) => {
              const maxRevenue = Math.max(...data.revenueByMonth.map(d => d.revenue));
              const percentage = (item.revenue / maxRevenue) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatNumber(item.posts)} bài đăng
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Posts by Status */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái bài đăng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.postsByStatus.active)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {((data.postsByStatus.active / data.overview.totalPosts) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.postsByStatus.pending)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {((data.postsByStatus.pending / data.overview.totalPosts) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Hết hạn</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.postsByStatus.expired)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {((data.postsByStatus.expired / data.overview.totalPosts) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Cities and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
            Top 5 thành phố
          </h3>
          <div className="space-y-3">
            {data.topCities.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{city.city}</p>
                    <p className="text-sm text-gray-600">{formatNumber(city.count)} bài đăng</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(city.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts by Category */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HomeIcon className="h-5 w-5 mr-2 text-blue-600" />
            Phân loại bài đăng
          </h3>
          <div className="space-y-4">
            {data.postsByCategory.map((category, index) => {
              const totalPosts = data.postsByCategory.reduce((sum, c) => sum + c.count, 0);
              const percentage = (category.count / totalPosts) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{category.category}</span>
                    <span className="text-gray-600">{formatNumber(category.count)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                        'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Landlords */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Top 5 chủ nhà xuất sắc
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xếp hạng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ nhà
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số bài đăng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.topLandlords.map((landlord, index) => (
                <tr key={landlord._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {landlord.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{landlord.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {formatNumber(landlord.totalPosts)} bài
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(landlord.totalRevenue)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {landlord.averageRating ? landlord.averageRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.overview.averageRating ? data.overview.averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-full">
              <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.overview.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bài đăng chờ duyệt</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(data.postsByStatus.pending)}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
