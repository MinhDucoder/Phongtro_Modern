'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  UserGroupIcon,
  HomeIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// Mock data
const stats = {
  totalUsers: 12543,
  totalPosts: 8756,
  totalViews: 234567,
  activeUsers: 3456,
  userGrowth: 12.5,
  postGrowth: 8.3,
  viewGrowth: 15.2,
  activeUserGrowth: -2.1
};

const recentActivity = [
  { id: 1, type: 'user', message: 'Người dùng mới đăng ký: Nguyễn Văn A', time: '2 phút trước' },
  { id: 2, type: 'post', message: 'Tin đăng mới: Phòng trọ tại Hà Nội', time: '5 phút trước' },
  { id: 3, type: 'view', message: 'Tin đăng được xem nhiều: Phòng trọ giá rẻ', time: '10 phút trước' },
  { id: 4, type: 'user', message: 'Người dùng mới đăng ký: Trần Thị B', time: '15 phút trước' },
  { id: 5, type: 'post', message: 'Tin đăng được duyệt: Căn hộ tại TP.HCM', time: '20 phút trước' }
];

const topLocations = [
  { name: 'Hà Nội', posts: 2345, views: 45678 },
  { name: 'TP. Hồ Chí Minh', posts: 3456, views: 67890 },
  { name: 'Đà Nẵng', posts: 1234, views: 23456 },
  { name: 'Hải Phòng', posts: 987, views: 18765 },
  { name: 'Cần Thơ', posts: 765, views: 15432 }
];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darker">Phân tích dữ liệu</h1>
          <p className="text-gray-600">Thống kê và phân tích hiệu suất website</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">24 giờ qua</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-darker">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(stats.userGrowth)}
                <span className={`text-sm ml-1 ${getGrowthColor(stats.userGrowth)}`}>
                  {Math.abs(stats.userGrowth)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng tin đăng</p>
              <p className="text-2xl font-bold text-darker">{stats.totalPosts.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(stats.postGrowth)}
                <span className={`text-sm ml-1 ${getGrowthColor(stats.postGrowth)}`}>
                  {Math.abs(stats.postGrowth)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
              <p className="text-2xl font-bold text-darker">{stats.totalViews.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(stats.viewGrowth)}
                <span className={`text-sm ml-1 ${getGrowthColor(stats.viewGrowth)}`}>
                  {Math.abs(stats.viewGrowth)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
              <p className="text-2xl font-bold text-darker">{stats.activeUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(stats.activeUserGrowth)}
                <span className={`text-sm ml-1 ${getGrowthColor(stats.activeUserGrowth)}`}>
                  {Math.abs(stats.activeUserGrowth)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-darker mb-4">Lượt truy cập theo thời gian</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-darker mb-4">Top địa điểm</h3>
          <div className="space-y-4">
            {topLocations.map((location, index) => (
              <div key={location.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-darker">{location.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-darker">{location.posts.toLocaleString()} tin</p>
                  <p className="text-xs text-gray-500">{location.views.toLocaleString()} lượt xem</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-darker">Hoạt động gần đây</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'post' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-darker">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
