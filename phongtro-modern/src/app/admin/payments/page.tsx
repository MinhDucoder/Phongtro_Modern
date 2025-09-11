import AdminLayout from '@/components/admin/AdminLayout';
import PaymentManagement from '@/components/admin/PaymentManagement';

export default function PaymentsPage() {
  return (
    <AdminLayout>
      <PaymentManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Quản lý thanh toán | Admin Panel | Phongtro123.com',
  description: 'Quản lý và theo dõi các giao dịch thanh toán.',
};
