'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { customToast } from '@/components/ui/CustomToast';

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'user' | 'landlord' | 'admin';
  is_verified: boolean;
  is_banned: boolean;
  is_deleted?: boolean;
  created_at: string;
  last_login: string;
  balance: number;
  ban_reason?: string;
  banned_at?: string;
  deleted_at?: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit form fields
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    is_verified: false,
    is_banned: false,
    ban_reason: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Create URL parameters object
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      // Add search term if present
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      // Add role filter if not "all"
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
        console.log(`Adding role filter: ${roleFilter}`);
      }
      
      // Add status filter if not "all"
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
        console.log(`Adding status filter: ${statusFilter}`);
      }

      const apiUrl = `/api/admin/users?${params.toString()}`;
      console.log('Fetching users from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetch users response:', {
        success: data.success,
        totalUsers: data.data?.pagination?.totalUsers || 0,
        currentUsers: data.data?.users?.length || 0
      });

      if (data.success) {
        // Set the user data
        setUsers(data.data.users);
        setStats(data.data.statistics);
        setTotalPages(data.data.pagination.totalPages);
        
        // If we're on a page with no results and it's not the first page, go back one page
        if (data.data.users.length === 0 && page > 1) {
          console.log('No users on this page, going back to previous page');
          setPage(page - 1);
          return; // This will trigger a re-fetch with the new page
        }
        
        // Reset selected users when data changes
        setSelectedUsers([]);
      } else {
        console.error('Error fetching users:', data);
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
  
  const [forceDelete, setForceDelete] = useState(false);
  
  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(true);
      console.log('Deleting user with ID:', userId);
      
      let response;
      
      if (forceDelete) {
        // Use force delete for permanent deletion
        console.log('Using FORCE DELETE');
        response = await fetch(`/api/admin/users/${userId}/force-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ confirmation: 'HARD_DELETE_CONFIRM' })
        });
      } else {
        // Use regular (soft) delete
        console.log('Using regular soft delete');
        response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
      }

      console.log('Delete user response status:', response.status);
      const data = await response.json();
      console.log('Delete user response data:', data);

      // Consider both 200 OK and other success status codes (like 202 Accepted)
      if (response.ok) {
        customToast.success('Xóa người dùng thành công');
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        
        // Remove user from local state immediately for smooth UX
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        
        // Wait a moment before fetching to give the server time to process
        setTimeout(() => {
          // Then fetch updated data including new statistics
          fetchUsers();
        }, 1000); // Increased timeout to give more time for backend processing
      } else {
        customToast.error(data.message || 'Lỗi khi xóa người dùng');
      }
      
      // Always refresh the data regardless of success/failure response
      // This ensures our UI stays in sync even if the backend processing is delayed
      setTimeout(() => fetchUsers(), 2000);
    } catch (error) {
      console.error('Error deleting user:', error);
      customToast.error('Lỗi khi xóa người dùng');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    // Validate required fields
    if (!editForm.full_name.trim() || !editForm.email.trim()) {
      customToast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      customToast.error('Vui lòng nhập email hợp lệ');
      return;
    }
    
    try {
      // Add loading state
      const setUpdating = true;
      
      // Prepare data to send, including the new fields
      const userData = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        address: editForm.address,
        is_verified: editForm.is_verified,
        is_banned: editForm.is_banned,
        ban_reason: editForm.is_banned ? editForm.ban_reason : ''
      };
      
      console.log('Updating user with data:', userData);
      
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        customToast.success('Cập nhật thông tin người dùng thành công');
        setShowEditModal(false);
        fetchUsers();
      } else {
        customToast.error(data.message || 'Lỗi khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      customToast.error('Lỗi khi cập nhật thông tin người dùng');
    }
  };

  // Helper function to format dates safely
  const formatDate = (dateString?: string, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không hợp lệ';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không hợp lệ';
    }
  };
  
  // Helper function to format time ago
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
          
          <div className="flex items-center">
            <button
              onClick={async () => {
                const params = new URLSearchParams({
                  role: roleFilter, 
                  status: statusFilter,
                  search: searchTerm || ''
                });
                
                try {
                  const response = await fetch(`/api/admin/users/debug?${params}`);
                  const data = await response.json();
                  console.log('Debug filter info:', data);
                  customToast.info(`Filter debug info in console: role=${roleFilter}, status=${statusFilter}`);
                } catch (error) {
                  console.error('Debug error:', error);
                }
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              title="Debug filters"
            >
              Kiểm tra bộ lọc
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <label htmlFor="role-filter" className="block text-xs text-gray-500 mb-1">Lọc theo vai trò</label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => {
                  console.log("Setting role filter to:", e.target.value);
                  setRoleFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="user">Người dùng thường</option>
                <option value="landlord">Chủ nhà</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="relative">
              <label htmlFor="status-filter" className="block text-xs text-gray-500 mb-1">Lọc theo trạng thái</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  console.log("Setting status filter to:", e.target.value);
                  setStatusFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="banned">Đã cấm</option>
                <option value="verified">Đã xác thực</option>
                <option value="unverified">Chưa xác thực</option>
                <option value="deleted">Đã xóa</option>
              </select>
            </div>
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
                      {formatDate(user.created_at)}
                      <div className="text-xs text-gray-400">
                        Hoạt động: {formatTimeAgo(user.last_login)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetail(true);
                          }}
                          title="Xem chi tiết"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditForm({
                              full_name: user.full_name,
                              email: user.email,
                              phone: user.phone,
                              role: user.role,
                              address: user.address || '',
                              is_verified: user.is_verified,
                              is_banned: user.is_banned,
                              ban_reason: user.ban_reason || ''
                            });
                            setShowEditModal(true);
                          }}
                          title="Chỉnh sửa thông tin"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          title={user.is_banned ? "Bỏ khóa tài khoản" : "Khóa tài khoản"}
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
                          title={user.is_verified ? "Hủy xác thực" : "Xác thực người dùng"}
                          className={`${
                            user.is_verified
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          <ShieldCheckIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          title="Xóa người dùng"
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
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

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 z-10">
              <h3 className="text-lg font-medium text-gray-900">
                Thông tin chi tiết người dùng
              </h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* User Header */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-0 sm:ml-6 mt-3 sm:mt-0 text-center sm:text-left">
                  <h4 className="text-2xl font-medium text-gray-900">
                    {selectedUser.full_name}
                  </h4>
                  <div className="flex flex-wrap items-center mt-2 justify-center sm:justify-start gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser)}
                    {selectedUser.is_deleted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border-red-200">
                        Đã xóa
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    ID: <span className="font-mono text-gray-700">{selectedUser._id}</span>
                  </div>
                </div>
                <div className="flex-grow"></div>
                <div className="hidden sm:block mt-3 sm:mt-0">
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-500">
                      Ngày đăng ký: <span className="font-medium">{formatDate(selectedUser.created_at)}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Hoạt động cuối: <span className="font-medium">{formatTimeAgo(selectedUser.last_login)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li className="mr-2">
                  <a href="#" className="inline-block p-4 border-b-2 border-blue-600 rounded-t-lg text-blue-600">
                    Thông tin cá nhân
                  </a>
                </li>
                <li className="mr-2">
                  <a href="#" className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300">
                    Hoạt động gần đây
                  </a>
                </li>
                <li className="mr-2">
                  <a href="#" className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300">
                    Giao dịch
                  </a>
                </li>
                <li className="mr-2">
                  <a href="#" className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300">
                    Phòng đã thuê
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Thông tin liên hệ
                    </h5>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Email:</span>
                        <div className="font-medium text-gray-900 flex items-center">
                          {selectedUser.email}
                          {selectedUser.is_verified && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Điện thoại:</span>
                        <div className="font-medium text-gray-900">
                          {selectedUser.phone ? (
                            <a href={`tel:${selectedUser.phone}`} className="text-blue-600 hover:underline">
                              {selectedUser.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">Chưa cập nhật</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Địa chỉ:</span>
                        <div className="font-medium text-gray-900">
                          {selectedUser.address || (
                            <span className="text-gray-400">Chưa cập nhật</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Thông tin tài khoản
                    </h5>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Vai trò:</span>
                        <div className="font-medium">{getRoleBadge(selectedUser.role)}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Ngày đăng ký:</span>
                        <div className="font-medium text-gray-900">
                          {formatDate(selectedUser.created_at, true)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Đăng nhập cuối:</span>
                        <div className="font-medium text-gray-900">
                          {selectedUser.last_login 
                            ? formatDate(selectedUser.last_login, true)
                            : 'Chưa đăng nhập'}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Số dư tài khoản:</span>
                        <div className="font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(selectedUser.balance || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Account Status */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Trạng thái tài khoản
                    </h5>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Trạng thái xác thực:</span>
                        <div>
                          {selectedUser.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Đã xác thực
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Chưa xác thực
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Trạng thái khoá:</span>
                        <div>
                          {selectedUser.is_banned ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                              </svg>
                              Đang bị khoá
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Đang hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedUser.is_banned && (
                        <>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mb-1">Lý do khoá:</span>
                            <div className="font-medium text-gray-900 p-3 bg-red-50 rounded-md border border-red-100">
                              {selectedUser.ban_reason || 'Không có lý do được ghi chú'}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Thời điểm khoá:</span>
                            <div className="font-medium text-gray-900">
                              {selectedUser.banned_at 
                                ? formatDate(selectedUser.banned_at, true)
                                : 'Không rõ'}
                            </div>
                          </div>
                        </>
                      )}
                      {selectedUser.is_deleted && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Thời điểm xóa:</span>
                            <div className="font-medium text-gray-900">
                              {selectedUser.deleted_at 
                                ? formatDate(selectedUser.deleted_at, true)
                                : 'Không rõ'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Thống kê hoạt động
                    </h5>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                        <div className="text-2xl font-semibold text-blue-700">0</div>
                        <div className="text-sm text-gray-600">Bài đăng</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                        <div className="text-2xl font-semibold text-green-700">0</div>
                        <div className="text-sm text-gray-600">Phòng đã thuê</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                        <div className="text-2xl font-semibold text-purple-700">0</div>
                        <div className="text-sm text-gray-600">Giao dịch</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg text-center border border-amber-100">
                        <div className="text-2xl font-semibold text-amber-700">0</div>
                        <div className="text-sm text-gray-600">Đánh giá</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUserDetail(false);
                  setEditForm({
                    full_name: selectedUser.full_name,
                    email: selectedUser.email,
                    phone: selectedUser.phone,
                    role: selectedUser.role,
                    address: selectedUser.address || '',
                    is_verified: selectedUser.is_verified,
                    is_banned: selectedUser.is_banned,
                    ban_reason: selectedUser.ban_reason || ''
                  });
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => {
                  setShowUserDetail(false);
                  setShowBanModal(true);
                }}
                className={`px-4 py-2 rounded-md ${
                  selectedUser.is_banned
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {selectedUser.is_banned ? 'Bỏ khoá tài khoản' : 'Khoá tài khoản'}
              </button>
              <button
                onClick={() => setShowUserDetail(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 z-10">
              <h3 className="text-xl font-medium text-gray-900 flex items-center">
                <PencilIcon className="h-6 w-6 mr-2 text-blue-600" />
                Chỉnh sửa thông tin người dùng
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* User Header */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold shadow-md">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">ID người dùng:</div>
                  <div className="font-mono text-sm text-gray-700">{selectedUser._id}</div>
                  <div className="mt-1 flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Trạng thái hiện tại:</span>
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li className="mr-2">
                  <a href="#" className="inline-block p-4 border-b-2 border-blue-600 rounded-t-lg text-blue-600">
                    Thông tin cơ bản
                  </a>
                </li>
                <li className="mr-2">
                  <a href="#" className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300">
                    Nâng cao
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-5">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Thông tin cá nhân
                    </h5>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập họ tên người dùng"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập địa chỉ email"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email sẽ được dùng để đăng nhập và nhận thông báo.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập số điện thoại (nếu có)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập địa chỉ (nếu có)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Account Info */}
              <div className="space-y-5">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Thông tin tài khoản
                    </h5>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vai trò <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({...editForm, role: e.target.value as 'user' | 'landlord' | 'admin'})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="user">Người dùng</option>
                          <option value="landlord">Chủ nhà</option>
                          <option value="admin">Admin</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          {editForm.role === 'admin' ? 'Admin có đầy đủ quyền quản trị hệ thống' : 
                           editForm.role === 'landlord' ? 'Chủ nhà có thể đăng tin và quản lý bất động sản' : 
                           'Người dùng có thể tìm kiếm và thuê bất động sản'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Trạng thái xác thực:</span>
                        <div className="flex items-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 rounded focus:ring-2 focus:ring-blue-500" 
                              checked={editForm.is_verified || selectedUser.is_verified || false}
                              onChange={(e) => setEditForm({...editForm, is_verified: e.target.checked})}
                            />
                            <span className="ml-2 text-sm text-gray-700">Đã xác thực email</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Tình trạng khoá:</span>
                        <div className="flex items-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="form-checkbox h-5 w-5 text-red-600 transition duration-150 rounded focus:ring-2 focus:ring-red-500" 
                              checked={editForm.is_banned || selectedUser.is_banned || false}
                              onChange={(e) => setEditForm({...editForm, is_banned: e.target.checked})}
                            />
                            <span className="ml-2 text-sm text-gray-700">Tài khoản bị khoá</span>
                          </label>
                        </div>
                      </div>
                      
                      {(editForm.is_banned || selectedUser.is_banned) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lý do khoá
                          </label>
                          <textarea
                            value={editForm.ban_reason || selectedUser.ban_reason || ''}
                            onChange={(e) => setEditForm({...editForm, ban_reason: e.target.value})}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập lý do khoá tài khoản"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-blue-800">
                      Thay đổi mật khẩu người dùng yêu cầu gửi yêu cầu reset mật khẩu.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md border border-blue-200 hover:bg-blue-200"
                      onClick={() => {
                        /* Implement password reset functionality */
                        customToast.info('Chức năng đặt lại mật khẩu đang được phát triển');
                      }}
                    >
                      Gửi link reset mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xác nhận xóa người dùng
              </h3>
              <p className="text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{selectedUser.full_name}</span>? 
                {!forceDelete ? ' Người dùng sẽ bị đánh dấu là đã xóa.' : ' Người dùng sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu!'}
              </p>
              
              <div className="mb-6 mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-red-600"
                    checked={forceDelete}
                    onChange={() => setForceDelete(!forceDelete)}
                  />
                  <span className="ml-2 text-sm text-red-700 font-medium">
                    Xóa vĩnh viễn khỏi cơ sở dữ liệu (không thể khôi phục)
                  </span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setForceDelete(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                disabled={isDeleting}
                className={`px-4 py-2 ${forceDelete ? 'bg-red-700' : 'bg-red-600'} text-white rounded-md hover:${forceDelete ? 'bg-red-800' : 'bg-red-700'} disabled:opacity-50 flex items-center`}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Đang xóa...
                  </>
                ) : (
                  forceDelete ? 'Xóa vĩnh viễn' : 'Xóa người dùng'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedUser.is_banned ? 'Bỏ khoá tài khoản' : 'Khoá tài khoản người dùng'}
              </h3>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {!selectedUser.is_banned && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do khoá
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lý do khoá tài khoản này..."
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
                {selectedUser.is_banned ? 'Bỏ khoá' : 'Khoá tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}