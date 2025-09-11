import AdminLayout from '@/components/admin/AdminLayout';
import ModerationPanel from '@/components/admin/ModerationPanel';

export default function ModerationPage() {
  return (
    <AdminLayout>
      <ModerationPanel />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Kiểm duyệt tin đăng | Admin Panel | NhaTroVN',
  description: 'Quản lý và kiểm duyệt tin đăng cho thuê phòng trọ.',
};
