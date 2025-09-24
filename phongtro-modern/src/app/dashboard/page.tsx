'use client';

import { redirect } from 'next/navigation';
import DashboardLayoutFixed from '@/components/dashboard/DashboardLayoutFixed';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

// Mock auth check - trong thực tế sẽ check từ session/JWT
const isAuthenticated = true;

export default function DashboardPage() {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  return (
    <DashboardLayoutFixed>
      <DashboardOverview />
    </DashboardLayoutFixed>
  );
}

