'use client';

import DashboardLayoutFixed from '@/components/dashboard/DashboardLayoutFixed';
import UserSettings from '@/components/dashboard/UserSettings';

export default function SettingsPage() {
  return (
    <DashboardLayoutFixed>
      <UserSettings />
    </DashboardLayoutFixed>
  );
}
