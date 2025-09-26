import AdminLayout from '@/components/admin/AdminLayout';
import AdminUserManagement from '@/components/admin/AdminUserManagement';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin người dùng, thống kê hoạt động và các tác vụ quản trị
          </p>
        </div>
        <AdminUserManagement />
      </div>
    </AdminLayout>
  );
}
