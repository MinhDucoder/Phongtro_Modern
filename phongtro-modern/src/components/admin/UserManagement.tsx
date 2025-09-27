'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  HomeIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'landlord' | 'admin';
  is_banned: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  banned_at?: string;
  ban_reason?: string;
  post_count?: number;
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  landlords: number;
  regularUsers: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
    };
    statistics: UserStatistics;
  };
  message?: string;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
          Admin
        </span>
      );
    case 'landlord':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <HomeIcon className="h-3 w-3 mr-1" />
          Chủ nhà
        </span>
      );
    case 'user':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <UserIcon className="h-3 w-3 mr-1" />
          Người dùng
        </span>
      );
    default:
      return null;
  }
};

const getStatusBadge = (user: User) => {
  if (user.is_banned) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        Bị khóa
      </span>
    );
  }
  
  if (user.is_verified) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Đã xác thực
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <ClockIcon className="h-3 w-3 mr-1" />
      Chưa xác thực
    </span>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStatistics>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    verifiedUsers: 0,
    landlords: 0,
    regularUsers: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    // Debounce search term
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      
      const data: ApiResponse = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setStats(data.data.statistics);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toastManager.showError(data.message || 'Lỗi khi tải danh sách user');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toastManager.showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: banReason })
      });

      const data = await response.json();

      if (data.success) {
        toastManager.showSuccess(user.is_banned ? 'Đã bỏ khóa tài khoản' : 'Đã khóa tài khoản');
        fetchUsers();
        setShowBanModal(false);
        setBanReason('');
      } else {
        toastManager.showError(data.message || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toastManager.showError('Lỗi khi cập nhật trạng thái user');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_verified: !user.is_verified })
      });

      const data = await response.json();

      if (data.success) {
        toastManager.showSuccess(`Đã ${user.is_verified ? 'hủy xác thực' : 'xác thực'} tài khoản`);
        fetchUsers();
      } else {
        toastManager.showError(data.message);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toastManager.showError('Lỗi khi cập nhật trạng thái xác thực');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          toastManager.showSuccess('Đã xóa người dùng thành công');
          fetchUsers();
        } else {
          toastManager.showError(data.message || 'Không thể xóa người dùng');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toastManager.showError('Lỗi kết nối server');
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không hợp lệ';
      }
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không hợp lệ';
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không hợp lệ';
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return `${diffInDays} ngày trước`;
      
      return formatDate(dateString);
    } catch (error) {
      console.error('Error formatting time ago:', error);
      return 'Không hợp lệ';
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-2">Quản lý tài khoản và quyền hạn người dùng</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Thêm người dùng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Tổng người dùng</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.verifiedUsers}</div>
              <div className="text-sm text-gray-600">Đã xác thực</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <HomeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.landlords}</div>
              <div className="text-sm text-gray-600">Chủ nhà</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="landlord">Chủ nhà</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Bị khóa</option>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tin đăng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đăng ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không tìm thấy dữ liệu người dùng
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            {user.is_verified && (
                              <ShieldCheckIcon className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.post_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_verified 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={user.is_verified ? 'Bỏ xác thực' : 'Xác thực'}
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_banned
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={user.is_banned ? 'Bỏ khóa' : 'Khóa tài khoản'}
                        >
                          {user.is_banned ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : (
                            <XCircleIcon className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Logic to center current page
                  let pageNum = page;
                  if (page < 3) {
                    pageNum = i + 1;
                  } else if (page > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          pageNum === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBanModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    {selectedUser?.is_banned ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedUser?.is_banned ? 'Bỏ khóa tài khoản' : 'Khóa tài khoản người dùng'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedUser?.is_banned
                          ? `Bạn có chắc muốn bỏ khóa tài khoản của ${selectedUser.full_name}?`
                          : `Bạn có chắc muốn khóa tài khoản của ${selectedUser.full_name}?`}
                      </p>
                    </div>
                    {!selectedUser?.is_banned && (
                      <div className="mt-4">
                        <label htmlFor="ban-reason" className="block text-sm font-medium text-gray-700">Lý do khóa tài khoản</label>
                        <textarea
                          id="ban-reason"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Nhập lý do khóa tài khoản..."
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    selectedUser?.is_banned
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                  onClick={() => selectedUser && handleBanUser(selectedUser)}
                >
                  {selectedUser?.is_banned ? 'Bỏ khóa' : 'Khóa tài khoản'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
