import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <AnalyticsDashboard />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Phân tích dữ liệu | Admin Panel | NhaTroVN',
  description: 'Thống kê và phân tích dữ liệu website cho thuê phòng trọ.',
};
