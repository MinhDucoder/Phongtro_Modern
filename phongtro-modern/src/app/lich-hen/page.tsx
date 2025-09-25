import SchedulingSystem from '@/components/scheduling/SchedulingSystem';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SchedulingPage() {
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
