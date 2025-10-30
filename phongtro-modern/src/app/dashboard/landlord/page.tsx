'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { useLandlordOverview } from '@/hooks/useLandlordStats';
import PostsTable from '@/components/dashboard/landlord/PostsTable';
import ViewsVisitsChart from '@/components/dashboard/landlord/ViewsVisitsChart';
import { useSearchParams } from 'next/navigation';

export default function LandlordDashboardPage() {
  return (
    <RoleGuard allowedRoles={["landlord", "admin"]}>
      <Content />
    </RoleGuard>
  );
}

function Content() {
  const { data, loading, error } = useLandlordOverview();
  const searchParams = useSearchParams();
  const selectedPost = searchParams.get('post');

  if (loading) {
    return (
      <div className="p-6">Đang tải thống kê...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Landlord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tin đang hoạt động" value={data?.activePosts ?? 0} />
        <StatCard title="Phòng còn trống" value={data?.availableRooms ?? 0} />
        <StatCard title="Views (7 ngày)" value={data?.last7Days.views ?? 0} />
        <StatCard title="Visits (7 ngày)" value={data?.last7Days.uniqueViews ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PostsTable />
        </div>
        <div className="lg:col-span-1">
          <ViewsVisitsChart postId={selectedPost} range={7} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}


