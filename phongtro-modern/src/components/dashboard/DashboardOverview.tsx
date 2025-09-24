'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DocumentTextIcon,
  EyeIcon,
  PhoneIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  CreditCardIcon,
  HandRaisedIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '@/lib/api';
import toast from 'react-hot-toast';

const recentActivities = [
  {
    id: 1,
    type: 'request',
    message: 'Có yêu cầu thuê mới từ Nguyễn Văn A',
    time: '5 phút trước',
    property: 'Phòng trọ gần ĐH Bách Khoa',
  },
  {
    id: 2,
    type: 'view',
    message: 'Có người xem tin "Phòng trọ gần ĐH Bách Khoa"',
    time: '2 phút trước',
    property: 'Phòng trọ gần ĐH Bách Khoa',
  },
  {
    id: 3,
    type: 'call',
    message: 'Có cuộc gọi từ 098****567',
    time: '15 phút trước',
    property: 'Căn hộ mini Hai Bà Trưng',
  },
  {
    id: 4,
    type: 'like',
    message: 'Tin đăng được thêm vào yêu thích',
    time: '1 giờ trước',
    property: 'Phòng trọ full nội thất',
  },
];

const myPostings = [
  {
    id: '1',
    title: 'Phòng trọ gần ĐH Bách Khoa, full nội thất',
    price: '3.5 triệu/tháng',
    area: '25 m²',
    location: 'Hai Bà Trưng, Hà Nội',
    image: '/placeholder-room.svg',
    status: 'active',
    views: 234,
    likes: 12,
    posted: '2 ngày trước',
  },
  {
    id: '2',
    title: 'Căn hộ mini 1PN, có ban công, gần chợ',
    price: '4.2 triệu/tháng',
    area: '35 m²',
    location: 'Thanh Xuân, Hà Nội',
    image: '/placeholder-room.svg',
    status: 'pending',
    views: 89,
    likes: 5,
    posted: '1 ngày trước',
  },
  {
    id: '3',
    title: 'Phòng trọ giá rẻ, gần trường ĐH Kinh tế',
    price: '2.8 triệu/tháng',
    area: '20 m²',
    location: 'Đống Đa, Hà Nội',
    image: '/placeholder-room.svg',
    status: 'expired',
    views: 567,
    likes: 23,
    posted: '1 tuần trước'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hiển thị</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
    case 'expired':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Hết hạn</span>;
    default:
      return null;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'request':
      return <HandRaisedIcon className="h-5 w-5 text-orange-500" />;
    case 'view':
      return <EyeIcon className="h-5 w-5 text-blue-500" />;
    case 'call':
      return <PhoneIcon className="h-5 w-5 text-green-500" />;
    case 'like':
      return <HeartIcon className="h-5 w-5 text-red-500" />;
    case 'approved':
      return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
  }
};

export default function DashboardOverview() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getOverview();
      
      if (response && response.data) {
        setOverview(response.data);
        toast.success('Đã tải dữ liệu dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      toast.error('Không thể tải dữ liệu dashboard');
      // Fallback to mock data on error
      setOverview({
        stats: {
          totalPosts: 12,
          pendingRequests: 3,
          todayViews: 2847,
          todayRevenue: 250000
        },
        changes: {
          postsChange: '+2',
          requestsChange: '+3',
          viewsChange: '+12%',
          revenueChange: '+18%'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = overview ? [
    {
      name: 'Tổng tin đăng',
      value: overview.stats.totalPosts?.toString() || '0',
      change: overview.changes.postsChange || '+0',
      changeType: 'increase',
      icon: DocumentTextIcon,
    },
    {
      name: 'Yêu cầu thuê',
      value: overview.stats.pendingRequests?.toString() || '0',
      change: overview.changes.requestsChange || '+0',
      changeType: 'increase',
      icon: HandRaisedIcon,
    },
    {
      name: 'Lượt xem hôm nay',
      value: overview.stats.todayViews?.toLocaleString() || '0',
      change: overview.changes.viewsChange || '+0%',
      changeType: 'increase',
      icon: EyeIcon,
    },
    {
      name: 'Doanh thu hôm nay',
      value: overview.stats.todayRevenue ? `${(overview.stats.todayRevenue / 1000)}K` : '0',
      change: overview.changes.revenueChange || '+0%',
      changeType: 'increase',
      icon: CreditCardIcon,
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
        <p className="text-blue-100 mb-4">
          Bạn có {overview?.stats?.pendingRequests || 0} yêu cầu thuê mới cần xử lý và {overview?.stats?.todayViews || 0} lượt xem mới trong hôm nay.
        </p>
        <Link
          href="/dang-tin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Đăng tin mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.property}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard/hoat-dong"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Xem tất cả hoạt động →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Rental Requests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Yêu cầu thuê gần đây</h3>
              <Link
                href="/dashboard/yeu-cau-thue"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <HandRaisedIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">Nguyễn Văn A</p>
                  <p className="text-sm text-gray-500">Phòng trọ gần ĐH Bách Khoa</p>
                  <p className="text-xs text-orange-600">5 phút trước</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Chờ xử lý
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">Trần Thị B</p>
                  <p className="text-sm text-gray-500">Căn hộ mini Hai Bà Trưng</p>
                  <p className="text-xs text-green-600">2 giờ trước</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Đã chấp nhận
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">Lê Văn C</p>
                  <p className="text-sm text-gray-500">Phòng trọ full nội thất</p>
                  <p className="text-xs text-gray-600">1 ngày trước</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Chờ xử lý
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Chart Placeholder */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thống kê lượt xem</h3>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Biểu đồ thống kê</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tính năng sẽ được cập nhật trong phiên bản tiếp theo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Recent Postings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Tin đăng gần đây</h3>
            <Link
              href="/dashboard/tin-dang"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {myPostings.map((posting) => (
              <div key={posting.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Image
                  src={posting.image}
                  alt={posting.title || 'Post image'}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {posting.title}
                    </h4>
                    {getStatusBadge(posting.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {posting.location} • {posting.area}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">{posting.price}</span>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {posting.views}
                      </span>
                      <span className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        {posting.likes}
                      </span>
                      <span>{posting.posted}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
