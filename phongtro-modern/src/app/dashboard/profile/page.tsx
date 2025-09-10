import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserProfile from '@/components/dashboard/UserProfile';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <UserProfile />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Thông tin cá nhân | Phongtro123.com',
  description: 'Cập nhật thông tin cá nhân và cài đặt tài khoản.',
};
