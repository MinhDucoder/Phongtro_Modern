'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { AdminOnly } from '@/components/auth/ProtectedRoute';

export default function AnalyticsPage() {
  return (
    <AdminOnly>
      <AdminLayout>
        <AnalyticsDashboard />
      </AdminLayout>
    </AdminOnly>
  );
}
