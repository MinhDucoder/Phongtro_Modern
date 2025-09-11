'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface StatCard {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'new_post' | 'payment' | 'report' | 'moderation';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'rejected';
}

const stats: StatCard[] = [
  {
    name: 'Tổng người dùng',
    value: '12,847',
    change: '+12%',
    changeType: 'increase',
    icon: UsersIcon,
    color: 'blue'
  },
  {
    name: 'Tin đăng mới',
    value: '1,234',
    change: '+8%',
    changeType: 'increase',
    icon: DocumentTextIcon,
    color: 'green'
  },
  {
    name: 'Doanh thu tháng',
    value: '45.2M',
    change: '+23%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
    color: 'purple'
  },
  {
    name: 'Lượt truy cập',
    value: '89.5K',
    change: '+15%',
    changeType: 'increase',
    icon: EyeIcon,
    color: 'orange'
  },
  {
    name: 'Báo cáo vi phạm',
    value: '23',
    change: '-5%',
    changeType: 'decrease',
    icon: ExclamationTriangleIcon,
    color: 'red'
  },
  {
    name: 'Tin chờ duyệt',
    value: '156',
    change: '+3%',
    changeType: 'increase',
    icon: ClockIcon,
    color: 'yellow'
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'user_registration',
    title: 'Người dùng mới đăng ký',
    description: 'Nguyễn Văn A đã đăng ký tài khoản',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '2',
    type: 'new_post',
    title: 'Tin đăng mới cần duyệt',
    description: 'Phòng trọ gần ĐH Bách Khoa - Cần kiểm duyệt',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'pending'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Thanh toán thành công',
    description: 'Gói Premium - 150,000 VND',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '4',
    type: 'report',
    title: 'Báo cáo vi phạm mới',
    description: 'Tin đăng ID: 12345 - Nội dung không phù hợp',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'pending'
  },
  {
    id: '5',
    type: 'moderation',
    title: 'Tin đăng đã được duyệt',
    description: 'Căn hộ mini có ban công - Đã duyệt',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'completed'
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_registration':
      return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
    case 'new_post':
      return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
    case 'payment':
      return <CurrencyDollarIcon className="h-5 w-5 text-purple-500" />;
    case 'report':
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    case 'moderation':
      return <ShieldCheckIcon className="h-5 w-5 text-yellow-500" />;
    default:
      return <BellIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Hoàn thành
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-3 w-3 mr-1" />
          Chờ xử lý
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Từ chối
        </span>
      );
    default:
      return null;
  }
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-2">Theo dõi hoạt động và hiệu suất của platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'increase' ? (
                        <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                      )}
                      <span className="ml-1">{stat.change}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Quản lý người dùng</h3>
              <p className="text-sm text-gray-600">Xem và quản lý tài khoản</p>
            </div>
          </Link>
          
          <Link
            href="/admin/posts"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Kiểm duyệt tin đăng</h3>
              <p className="text-sm text-gray-600">Duyệt và quản lý tin đăng</p>
            </div>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Báo cáo & Thống kê</h3>
              <p className="text-sm text-gray-600">Xem báo cáo chi tiết</p>
            </div>
          </Link>
          
          <Link
            href="/admin/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Báo cáo vi phạm</h3>
              <p className="text-sm text-gray-600">Xử lý báo cáo</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
          <Link
            href="/admin/activities"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Xem tất cả
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
