import AdminLayout from '@/components/admin/AdminLayout';
import NotificationManagement from '@/components/admin/NotificationManagement';

export default function NotificationsPage() {
  return (
    <AdminLayout>
      <NotificationManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Thông báo hệ thống | Admin Panel | Phongtro123.com',
  description: 'Quản lý và gửi thông báo hệ thống cho người dùng.',
};
