'use client';

import DashboardLayoutFixed from '@/components/dashboard/DashboardLayoutFixed';
import UserProfile from '@/components/dashboard/UserProfile';

export default function ProfilePage() {
  return (
    <DashboardLayoutFixed>
      <UserProfile />
    </DashboardLayoutFixed>
  );
}

