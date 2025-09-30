'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api';
import {
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon,
  CogIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface OverviewData {
  stats?: {
    totalPosts?: number;
    activePosts?: number;
    pausedPosts?: number;
    pendingPosts?: number;
    expiredPosts?: number;
    pendingRequests?: number;
    totalViews?: number;
    totalPostsChange?: number;
    activePostsChange?: number;
    pausedPostsChange?: number;
    pendingRequestsChange?: number;
  };
  changes?: any;
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardApi.getOverview();
        if (res && (res.success === undefined || res.success === true)) {
          setData((res as any).data || null);
        } else {
          setError(res?.message || 'Không thể tải dữ liệu tổng quan');
        }
        // Fetch recent activities song song
        try {
          const actRes = await dashboardApi.getRecentActivities(6);
          if (actRes && (actRes.success === undefined || actRes.success === true)) {
            const activitiesData = (actRes as any).data || [];
            console.log('Activities data received:', activitiesData);
            setActivities(activitiesData);
          }
        } catch (e) {
          console.log('Error fetching activities:', e);
          // im lặng nếu lỗi phần phụ này
        }

        // Fetch top posts 7d
        try {
          const analyticsRes = await dashboardApi.getAnalytics({ timeRange: '7d' });
          if (analyticsRes && (analyticsRes.success === undefined || analyticsRes.success === true)) {
            const payload: any = (analyticsRes as any).data || {};
            setTopPosts(payload.topPerformingPosts || []);
          }
        } catch (e) {
          // im lặng
        }
      } catch (e: any) {
        setError(e?.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Main stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Secondary stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Không thể tải dữ liệu</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Tổng số tin" 
          value={stats.totalPosts ?? 0} 
          icon={DocumentTextIcon}
          color="blue"
          trend={stats.totalPostsChange}
        />
        <StatCard 
          label="Tin đang hoạt động" 
          value={stats.activePosts ?? 0} 
          icon={ChartBarIcon}
          color="green"
          trend={stats.activePostsChange}
        />
        <StatCard 
          label="Tin tạm dừng" 
          value={stats.pausedPosts ?? 0} 
          icon={ClockIcon}
          color="yellow"
          trend={stats.pausedPostsChange}
        />
        <StatCard 
          label="Yêu cầu chờ xử lý" 
          value={stats.pendingRequests ?? 0} 
          icon={UserGroupIcon}
          color="purple"
          trend={stats.pendingRequestsChange}
        />
      </div>
      
      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lượt xem tổng</p>
              <p className="text-2xl font-semibold text-gray-900">{(stats.totalViews ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tin chờ duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingPosts ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tin hết hạn</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.expiredPosts ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state CTA cho trường hợp chưa có tin */}
      {(stats.totalPosts ?? 0) === 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800">
          Bạn chưa có tin nào. <Link href="/dang-tin" className="underline font-medium">Tạo tin đầu tiên</Link> để bắt đầu.
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            href="/dang-tin" 
            className="group flex items-center p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
          >
            <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500 text-white group-hover:bg-blue-600">
              <PlusIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Đăng tin mới</p>
              <p className="text-xs text-blue-700">Tạo tin đăng phòng trọ</p>
            </div>
          </Link>
          
          <Link 
            href="/dashboard/tin-dang" 
            className="group flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            <div className="flex-shrink-0 p-2 rounded-lg bg-gray-500 text-white group-hover:bg-gray-600">
              <CogIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Quản lý tin</p>
              <p className="text-xs text-gray-700">Chỉnh sửa và cập nhật</p>
            </div>
          </Link>
          
          <Link 
            href="/dashboard/yeu-cau-thue" 
            className="group flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            <div className="flex-shrink-0 p-2 rounded-lg bg-gray-500 text-white group-hover:bg-gray-600">
              <UserGroupIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Yêu cầu thuê</p>
              <p className="text-xs text-gray-700">Xem và phản hồi</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activities */}
        <div className="rounded-lg border bg-white">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="divide-y">
            {activities.length === 0 ? (
              <div className="p-6 text-center">
                <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Chưa có hoạt động nào</p>
                <p className="text-xs text-gray-400 mt-1">Các hoạt động sẽ hiển thị ở đây</p>
              </div>
            ) : (
              activities.map((act, idx) => {
                const actKey = act.id || act._id || act.requestId || act.postId || `${act.type || 'activity'}-${idx}`;
                console.log('Activity item:', act); // Debug log
                return (
                <div key={actKey} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 rounded-full bg-blue-100">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{act.message || act.title || act.description || 'Hoạt động'}</p>
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const timeValue = act.time || act.createdAt || act.created_at || act.timestamp || act.date;
                          console.log('Time value for activity:', timeValue); // Debug log
                          if (!timeValue) return 'Không có thời gian';
                          
                          try {
                            const date = new Date(timeValue);
                            if (isNaN(date.getTime())) {
                              return 'Thời gian không hợp lệ';
                            }
                            return date.toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            console.log('Date parsing error:', error); // Debug log
                            return 'Thời gian không hợp lệ';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  {act.type === 'request' || act.type === 'rental_request' ? (
                    <Link href="/dashboard/yeu-cau-thue" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Xem</Link>
                  ) : (
                    <Link href="/dashboard/tin-dang" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Chi tiết</Link>
                  )}
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top posts 7 ngày */}
        <div className="rounded-lg border bg-white">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
              Top tin trong 7 ngày
            </h3>
          </div>
          {topPosts.length === 0 ? (
            <div className="p-6 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
              <p className="text-xs text-gray-400 mt-1">Hãy đăng tin và chia sẻ để tăng lượt xem</p>
            </div>
          ) : (
            <ul className="divide-y">
              {topPosts.slice(0, 5).map((p: any, idx: number) => {
                const postKey = p.id || p._id || p.postId || p.roomId?._id || `post-${idx}`;
                const views = p.views ?? p.analytics?.views ?? 0;
                return (
                <li key={postKey} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">#{idx + 1}</span>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.roomId?.title || p.title || 'Tin đăng'}</p>
                      <div className="flex items-center mt-1">
                        <EyeIcon className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{views.toLocaleString()} lượt xem</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/dashboard/tin-dang" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Quản lý</Link>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend 
}: { 
  label: string; 
  value: number; 
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  trend?: number;
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-500 text-white',
    red: 'bg-red-500 text-white'
  };

  const trendColor = trend && trend > 0 ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-500';
  const TrendIcon = trend && trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <div className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
            {trend !== undefined && (
              <div className={`ml-2 flex items-center text-sm ${trendColor}`}>
                {TrendIcon && <TrendIcon className="h-4 w-4 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

