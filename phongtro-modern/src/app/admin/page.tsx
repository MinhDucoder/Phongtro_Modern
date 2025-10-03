import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { AdminOnly } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <AdminOnly>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminOnly>
  );
}
