import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

// Mock auth check - trong thực tế sẽ check từ session/JWT
const isAuthenticated = true;

export default function DashboardPage() {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Dashboard - Quản lý tin đăng | Phongtro123.com',
  description: 'Quản lý tin đăng, theo dõi thống kê và cập nhật thông tin cá nhân.',
};
