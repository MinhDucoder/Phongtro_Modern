'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { customToast } from '@/components/ui/CustomToast';

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'landlord' | 'admin';
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
  last_login: string;
  balance: number;
  ban_reason?: string;
  banned_at?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  landlords: number;
  regularUsers: number;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    verifiedUsers: 0,
    landlords: 0,
    regularUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, searchTerm]);

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
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setStats(data.data.statistics);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        customToast.error(data.message || 'Lỗi khi tải danh sách user');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      customToast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleBanUser = async (user: User, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        customToast.success(data.message);
        fetchUsers();
        setShowBanModal(false);
        setBanReason('');
      } else {
        customToast.error(data.message);
      }
    } catch (error) {
      console.error('Error banning user:', error);
      customToast.error('Lỗi khi cập nhật trạng thái user');
    }
  };

  const handleUpdateUserStatus = async (userId: string, field: string, value: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value })
      });

      const data = await response.json();

      if (data.success) {
        customToast.success('Cập nhật thành công');
        fetchUsers();
      } else {
        customToast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      customToast.error('Lỗi khi cập nhật user');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      landlord: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const labels = {
      admin: 'Admin',
      landlord: 'Chủ nhà',
      user: 'Người dùng'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (user: User) => {
    if (user.is_banned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border-red-200">
          <NoSymbolIcon className="w-3 h-3 mr-1" />
          Đã cấm
        </span>
      );
    }
    
    if (user.is_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border-green-200">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Đã xác thực
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
        Chưa xác thực
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã xác thực</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.verifiedUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chủ nhà</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.landlords}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <NoSymbolIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã cấm</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.bannedUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="landlord">Chủ nhà</option>
              <option value="admin">Admin</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="banned">Đã cấm</option>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Danh sách Users ({users.length})
            </h3>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedUsers.length} đã chọn
                </span>
                <button
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  onClick={() => {/* Handle bulk ban */}}
                >
                  Cấm hàng loạt
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy user nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded"
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetail(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className={`${
                            user.is_banned 
                              ? 'text-green-600 hover:text-green-900' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          {user.is_banned ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <NoSymbolIcon className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleUpdateUserStatus(user._id, 'is_verified', !user.is_verified)}
                          className={`${
                            user.is_verified
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          <ShieldCheckIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ban/Unban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedUser.is_banned ? 'Bỏ cấm user' : 'Cấm user'}
            </h3>
            
            {!selectedUser.is_banned && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do cấm
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lý do cấm user này..."
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={() => handleBanUser(selectedUser, banReason)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  selectedUser.is_banned
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedUser.is_banned ? 'Bỏ cấm' : 'Cấm user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}