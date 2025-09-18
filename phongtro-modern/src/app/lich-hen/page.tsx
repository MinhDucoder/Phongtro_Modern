import { redirect } from 'next/navigation';
import SchedulingSystem from '@/components/scheduling/SchedulingSystem';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Mock auth check
const isAuthenticated = true;

export default function SchedulingPage() {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  return (
    <DashboardLayout>
      <SchedulingSystem />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Lịch hẹn xem phòng | NhaTroVN',
  description: 'Quản lý lịch hẹn xem phòng trọ và căn hộ.',
};
