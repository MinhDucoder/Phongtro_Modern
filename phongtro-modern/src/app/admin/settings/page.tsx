import AdminLayout from '@/components/admin/AdminLayout';
import AdminSettings from '@/components/admin/AdminSettings';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <AdminSettings />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Cài đặt hệ thống | Admin Panel | NhaTroVN',
  description: 'Cài đặt và cấu hình hệ thống quản trị.',
};
