import AdminLayout from '@/components/admin/AdminLayout';
import ReportsManagement from '@/components/admin/ReportsManagement';

export default function ReportsPage() {
  return (
    <AdminLayout>
      <ReportsManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Báo cáo vi phạm | Admin Panel | Phongtro123.com',
  description: 'Quản lý và xử lý các báo cáo vi phạm từ người dùng.',
};
