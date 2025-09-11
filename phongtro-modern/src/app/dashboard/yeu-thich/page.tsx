import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SavedProperties from '@/components/dashboard/SavedProperties';

export default function SavedPropertiesPage() {
  return (
    <DashboardLayout>
      <SavedProperties />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Tin đã lưu | NhaTroVN',
  description: 'Danh sách các tin đăng phòng trọ bạn đã lưu để xem sau.',
};
