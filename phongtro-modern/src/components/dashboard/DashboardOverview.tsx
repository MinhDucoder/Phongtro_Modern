'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api';

interface OverviewData {
  stats?: {
    totalPosts?: number;
    activePosts?: number;
    pendingRequests?: number;
    totalViews?: number;
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
            setActivities((actRes as any).data || []);
          }
        } catch (e) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-700">
        {error}
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng số tin" value={stats.totalPosts ?? 0} />
        <StatCard label="Tin đang hoạt động" value={stats.activePosts ?? 0} />
        <StatCard label="Tin tạm dừng" value={stats.pausedPosts ?? 0} />
        <StatCard label="Yêu cầu chờ xử lý" value={stats.pendingRequests ?? 0} />
      </div>
      
      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-700">Lượt xem tổng</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalViews ?? 0}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-700">Tin chờ duyệt</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.pendingPosts ?? 0}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-700">Tin hết hạn</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.expiredPosts ?? 0}</div>
        </div>
      </div>

      {/* Empty state CTA cho trường hợp chưa có tin */}
      {(stats.totalPosts ?? 0) === 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800">
          Bạn chưa có tin nào. <Link href="/dang-tin" className="underline font-medium">Tạo tin đầu tiên</Link> để bắt đầu.
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dang-tin" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Đăng tin mới</Link>
        <Link href="/dashboard/tin-dang" className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Quản lý tin</Link>
        <Link href="/dashboard/yeu-cau-thue" className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Xem yêu cầu thuê</Link>
      </div>

      {/* Recent activities */}
      <div className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-base font-semibold text-gray-900">Hoạt động gần đây</h3>
        </div>
        <div className="divide-y">
          {activities.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Chưa có hoạt động nào.</div>
          ) : (
            activities.map((act, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900">{act.message || 'Hoạt động'}</div>
                  <div className="text-xs text-gray-500">{new Date(act.time).toLocaleString('vi-VN')}</div>
                </div>
                {act.type === 'request' ? (
                  <Link href="/dashboard/yeu-cau-thue" className="text-sm text-blue-600 hover:underline">Xem</Link>
                ) : (
                  <Link href="/dashboard/tin-dang" className="text-sm text-blue-600 hover:underline">Chi tiết</Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top posts 7 ngày */}
      <div className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-base font-semibold text-gray-900">Top tin trong 7 ngày</h3>
        </div>
        {topPosts.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Chưa có dữ liệu. Hãy đăng tin và chia sẻ để tăng lượt xem.</div>
        ) : (
          <ul className="divide-y">
            {topPosts.slice(0, 5).map((p: any) => (
              <li key={p.id || p._id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.roomId?.title || p.title || 'Tin đăng'}</div>
                  <div className="text-xs text-gray-500">Lượt xem: {p.views ?? p.analytics?.views ?? 0}</div>
                </div>
                <Link href="/dashboard/tin-dang" className="text-sm text-blue-600 hover:underline">Quản lý</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

