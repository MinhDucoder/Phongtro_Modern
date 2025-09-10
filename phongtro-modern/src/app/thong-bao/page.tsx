import { redirect } from 'next/navigation';
import NotificationCenter from '@/components/notifications/NotificationCenter';

// Mock auth check
const isAuthenticated = true;

export default function NotificationsPage() {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <NotificationCenter />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Thông báo | Phongtro123.com',
  description: 'Trung tâm thông báo - theo dõi tất cả hoạt động và cập nhật.',
};
