'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { LandlordOnly } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <LandlordOnly>
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    </LandlordOnly>
  );
}

