import NotificationCenter from '@/components/notifications/NotificationCenter';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

export default function NotificationsPage() {
  return (
    <AuthRequired>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <NotificationCenter />
        </div>
      </DashboardLayout>
    </AuthRequired>
  );
}

export const metadata = {
  title: 'Thông báo | NhaTroVN',
  description: 'Trung tâm thông báo - theo dõi tất cả hoạt động và cập nhật.',
};
