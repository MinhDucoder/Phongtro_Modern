import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MyPostings from '@/components/dashboard/MyPostings';

export default function MyPostingsPage() {
  return (
    <DashboardLayout>
      <MyPostings />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Tin đăng của tôi | Phongtro123.com',
  description: 'Quản lý tất cả tin đăng cho thuê phòng trọ của bạn.',
};
