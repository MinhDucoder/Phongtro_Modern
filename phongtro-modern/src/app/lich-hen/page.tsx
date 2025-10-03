import SchedulingSystem from '@/components/scheduling/SchedulingSystem';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

export default function SchedulingPage() {
  return (
    <AuthRequired>
      <DashboardLayout>
        <SchedulingSystem />
      </DashboardLayout>
    </AuthRequired>
  );
}

export const metadata = {
  title: 'Lịch hẹn xem phòng | NhaTroVN',
  description: 'Quản lý lịch hẹn xem phòng trọ và căn hộ.',
};
