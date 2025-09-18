import YeuCauThueClient from './YeuCauThueClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata = {
  title: 'Quản lý yêu cầu thuê | NhaTroVN',
  description: 'Xem và xử lý các yêu cầu thuê phòng từ người dùng.',
};

export default function RentalRequestsPage() {
  return (
    <DashboardLayout>
      <YeuCauThueClient />
    </DashboardLayout>
  );
}
