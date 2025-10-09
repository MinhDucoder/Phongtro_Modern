'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRoleCheck } from '@/components/auth/RoleGuard';

export default function TestRolesPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const { hasRole, isUser, isLandlord, isAdmin, userRole } = useRoleCheck();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔐 Role-Based Access Control Test
          </h1>

          {/* Current User Info */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User Info</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User Role:</strong> {userRole || 'Not logged in'}</p>
              <p><strong>User Name:</strong> {user?.full_name || 'N/A'}</p>
              <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Role Check Results */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">Role Check Results</h2>
            <div className="space-y-2 text-sm">
              <p><strong>isUser():</strong> {isUser() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>isLandlord():</strong> {isLandlord() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>isAdmin():</strong> {isAdmin() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>hasRole([&apos;user&apos;]):</strong> {hasRole(['user']) ? '✅ Yes' : '❌ No'}</p>
              <p><strong>hasRole([&apos;landlord&apos;]):</strong> {hasRole(['landlord']) ? '✅ Yes' : '❌ No'}</p>
              <p><strong>hasRole([&apos;admin&apos;]):</strong> {hasRole(['admin']) ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {/* Role Guard Tests */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Guard Tests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* User Guard */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">UserGuard</h3>
                {isUser() ? (
                  <div className="text-green-600">✅ User Access Granted</div>
                ) : (
                  <div className="text-red-600">❌ Access Denied</div>
                )}
              </div>

              {/* Landlord Guard */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">LandlordGuard</h3>
                {isLandlord() ? (
                  <div className="text-green-600">✅ Landlord Access Granted</div>
                ) : (
                  <div className="text-red-600">❌ Access Denied</div>
                )}
              </div>

              {/* Admin Guard */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">AdminGuard</h3>
                {isAdmin() ? (
                  <div className="text-green-600">✅ Admin Access Granted</div>
                ) : (
                  <div className="text-red-600">❌ Access Denied</div>
                )}
              </div>
            </div>
          </div>

          {/* Protected Route Tests */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Protected Route Tests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Auth Required */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">AuthRequired</h3>
                {isAuthenticated ? (
                  <div className="text-green-600">✅ Authenticated Access</div>
                ) : (
                  <div className="text-red-600">❌ Not Authenticated</div>
                )}
              </div>

              {/* Landlord Only */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">LandlordOnly</h3>
                {isLandlord() ? (
                  <div className="text-green-600">✅ Landlord Access</div>
                ) : (
                  <div className="text-red-600">❌ Access Denied</div>
                )}
              </div>

              {/* Admin Only */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">AdminOnly</h3>
                {isAdmin() ? (
                  <div className="text-green-600">✅ Admin Access</div>
                ) : (
                  <div className="text-red-600">❌ Access Denied</div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Test */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation Test</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Check the header navigation to see which items are visible based on your role:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li><strong>Public:</strong> Phòng trọ, Nhà nguyên căn, Căn hộ, Tìm kiếm, Ở ghép, Mặt bằng, Blog, Bảng giá</li>
                <li><strong>Landlord:</strong> + Đăng tin, Dashboard</li>
                <li><strong>Admin:</strong> + Admin, Analytics</li>
              </ul>
            </div>
          </div>

          {/* Real Component Tests */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Real Component Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test Đăng tin button */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">&quot;Đăng tin&quot; Button</h3>
                {isLandlord() ? (
                  <div className="text-green-600">✅ Should be visible in header</div>
                ) : (
                  <div className="text-red-600">❌ Should be hidden</div>
                )}
              </div>

              {/* Test Dashboard link */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Dashboard Link</h3>
                {isLandlord() ? (
                  <div className="text-green-600">✅ Should be visible in navigation</div>
                ) : (
                  <div className="text-red-600">❌ Should be hidden</div>
                )}
              </div>

              {/* Test Admin link */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Admin Link</h3>
                {isAdmin() ? (
                  <div className="text-green-600">✅ Should be visible in navigation</div>
                ) : (
                  <div className="text-red-600">❌ Should be hidden</div>
                )}
              </div>

              {/* Test Analytics link */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Analytics Link</h3>
                {isAdmin() ? (
                  <div className="text-green-600">✅ Should be visible in navigation</div>
                ) : (
                  <div className="text-red-600">❌ Should be hidden</div>
                )}
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">Test Instructions</h2>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>To test different roles:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Logout and login with different user accounts</li>
                <li>Check which navigation items are visible</li>
                <li>Try accessing protected routes directly</li>
                <li>Verify that role guards work correctly</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
