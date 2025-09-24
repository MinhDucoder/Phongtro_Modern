'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserSettingsWrapper from '@/components/dashboard/UserSettingsWrapper';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <UserSettingsWrapper />
    </DashboardLayout>
  );
}
