'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PropertyAnalytics from '@/components/analytics/PropertyAnalytics';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <PropertyAnalytics />
    </DashboardLayout>
  );
}

