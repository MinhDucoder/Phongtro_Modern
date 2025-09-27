'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface AdminOverview {
  overview: {
    totalUsers: number;
    totalLandlords: number;
    totalTenants: number;
    totalRooms: number;
    totalPosts: number;
    activePosts: number;
    pendingPosts: number;
    rejectedPosts: number;
    expiredPosts: number;
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    totalViews: number;
    totalRevenue: number;
    newUsersThisMonth: number;
    newPostsThisMonth: number;
  };
  growth: {
    userGrowthRate: string;
    postGrowthRate: string;
    revenueGrowthRate: string;
  };
  recent: {
    users: Array<{
      _id: string;
      full_name: string;
      email: string;
      role: string;
      created_at: string;
    }>;
    posts: Array<{
      _id: string;
      roomTitle?: string;
      landlordName?: string;
      status: string;
      createdAt: string;
    }>;
    topPosts: Array<{
      _id: string;
      title: string;
      views: number;
      likes: number;
    }>;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          console.error('Error loading dashboard data:', result.message);
          // Fallback to mock data if API fails
          setData(getMockData());
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data if API fails
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getMockData = (): AdminOverview => ({
    overview: {
      totalUsers: 12847,
      totalLandlords: 3421,
      totalTenants: 9426,
      totalRooms: 5678,
      totalPosts: 1234,
      activePosts: 987,
      pendingPosts: 156,
      rejectedPosts: 67,
      expiredPosts: 24,
      totalRequests: 2341,
      pendingRequests: 123,
      acceptedRequests: 1987,
      totalViews: 156789,
      totalRevenue: 45000000,
      newUsersThisMonth: 234,
      newPostsThisMonth: 89
    },
    growth: {
      userGrowthRate: '+12.5%',
      postGrowthRate: '+8.3%',
      revenueGrowthRate: '+15.2%'
    },
    recent: {
      users: [
        {
          _id: '1',
          full_name: 'Nguyễn Văn A',
          email: 'a@example.com',
          role: 'landlord',
          created_at: new Date().toISOString()
        },
        {
          _id: '2',
          full_name: 'Trần Thị B',
          email: 'b@example.com',
          role: 'user',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '3',
          full_name: 'Lê Văn C',
          email: 'c@example.com',
          role: 'landlord',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      posts: [
        {
          _id: '1',
          roomTitle: 'Phòng trọ đẹp Q1',
          landlordName: 'Nguyễn Văn B',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          roomTitle: 'Căn hộ cao cấp Q7',
          landlordName: 'Trần Văn D',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '3',
          roomTitle: 'Nhà nguyên căn Q3',
          landlordName: 'Lê Thị E',
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      topPosts: [
        {
          _id: '1',
          title: 'Căn hộ cao cấp view sông',
          views: 5234,
          likes: 189
        },
        {
          _id: '2',
          title: 'Phòng trọ sinh viên giá rẻ',
          views: 4567,
          likes: 234
        },
        {
          _id: '3',
          title: 'Nhà nguyên căn 3 phòng ngủ',
          views: 3890,
          likes: 156
        }
      ]
    }
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có ngày';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Ngày không hợp lệ';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan hệ thống</h1>
          <p className="text-gray-600">Dashboard quản trị viên</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalUsers)}</p>
                <p className="text-sm text-green-600 mt-1">{data.growth.userGrowthRate} so với tháng trước</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài đăng</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalPosts)}</p>
                <p className="text-sm text-green-600 mt-1">{data.growth.postGrowthRate} so với tháng trước</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalViews)}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% so với tháng trước</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">{data.growth.revenueGrowthRate} so với tháng trước</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detail Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Posts Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái bài đăng</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Đang hoạt động</span>
                </div>
                <span className="font-semibold text-green-600">{formatNumber(data.overview.activePosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-gray-700">Chờ duyệt</span>
                </div>
                <span className="font-semibold text-yellow-600">{formatNumber(data.overview.pendingPosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-gray-700">Từ chối</span>
                </div>
                <span className="font-semibold text-red-600">{formatNumber(data.overview.rejectedPosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-gray-700">Hết hạn</span>
                </div>
                <span className="font-semibold text-gray-600">{formatNumber(data.overview.expiredPosts)}</span>
              </div>
            </div>
          </div>

          {/* User Types */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loại người dùng</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Chủ nhà</span>
                </div>
                <span className="font-semibold text-blue-600">{formatNumber(data.overview.totalLandlords)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Người thuê</span>
                </div>
                <span className="font-semibold text-green-600">{formatNumber(data.overview.totalTenants)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-700">Tổng phòng</span>
                </div>
                <span className="font-semibold text-purple-600">{formatNumber(data.overview.totalRooms)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng mới</h3>
            <div className="space-y-3">
              {data.recent.users.map((user) => (
                <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'landlord' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'landlord' ? 'Chủ nhà' : 'Người thuê'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài đăng chờ duyệt</h3>
            <div className="space-y-3">
              {data.recent.posts.map((post) => (
                <div key={post._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{post.roomTitle || 'Không có tiêu đề'}</p>
                    <p className="text-sm text-gray-500">Bởi {post.landlordName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {post.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài đăng phổ biến nhất</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt thích</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ tương tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recent.topPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{post.title}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatNumber(post.views)}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatNumber(post.likes)}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {post.views > 0 ? ((post.likes / post.views) * 100).toFixed(1) + '%' : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}