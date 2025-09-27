'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PencilIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'user' | 'landlord' | 'admin';
  is_verified: boolean;
  is_deleted?: boolean;
  created_at: string;
  last_login: string;
  balance: number;
  deleted_at?: string;
}

interface UserActivity {
  date: string;
  action: string;
  description: string;
  ip_address?: string;
}

interface UserStats {
  totalPosts: number;
  totalBookings: number;
  totalTransactions: number;
  totalReviews: number;
  averageRating: number;
  totalSpent: number;
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
}

export default function UserDetailModal({ 
  user, 
  isOpen, 
  onClose, 
  onEdit
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserDetails();
    }
  }, [isOpen, user?._id]);

  const fetchUserDetails = async () => {
    if (!user?._id) {
      console.error('No user ID available');
      return;
    }
    
    setLoading(true);
    try {
      // Fetch detailed user information
      const response = await fetch(`/api/admin/users/${user._id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update user stats from API response
          setUserStats(data.data.stats || {
            totalPosts: 0,
            totalBookings: 0,
            totalTransactions: 0,
            totalReviews: 0,
            averageRating: 0,
            totalSpent: 0
          });
          
          // Update user activities from API response
          setUserActivity(data.data.activities || []);
        } else {
          toastManager.showError(data.message || 'Lỗi khi tải thông tin chi tiết');
        }
      } else {
        toastManager.showError('Lỗi khi tải thông tin chi tiết');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toastManager.showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
              Thông tin chi tiết người dùng
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* User Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
              {user?.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900">
                {user?.full_name || 'N/A'}
              </h3>
              <div className="flex flex-wrap items-center mt-2 justify-center sm:justify-start gap-2">
                {user?.role && getRoleBadge(user.role)}
                {user && getStatusBadge(user)}
                {user?.is_deleted && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border-red-200">
                    Đã xóa
                  </span>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user?._id || 'N/A'}</span>
              </div>
            </div>
            <div className="flex-grow"></div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-2">
              <div className="text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Tham gia: <span className="font-medium">{formatDate(user?.created_at)}</span>
              </div>
              <div className="text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Hoạt động: <span className="font-medium">{formatTimeAgo(user?.last_login)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'info', label: 'Thông tin cá nhân', icon: DocumentTextIcon },
              { id: 'activity', label: 'Hoạt động', icon: ClockIcon },
              { id: 'posts', label: 'Bài đăng', icon: BuildingOfficeIcon },
              { id: 'transactions', label: 'Giao dịch', icon: BanknotesIcon },
              { id: 'reviews', label: 'Đánh giá', icon: StarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Thông tin liên hệ
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-900">{user?.email || 'N/A'}</span>
                      {user?.is_verified && (
                        <CheckCircleIcon className="h-4 w-4 ml-2 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                    <div className="mt-1">
                      {user?.phone ? (
                        <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline">
                          {user.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">Chưa cập nhật</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                    <div className="mt-1">
                      <span className="text-gray-900">
                        {user?.address || <span className="text-gray-400">Chưa cập nhật</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Trạng thái tài khoản
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Xác thực email</span>
                    {user?.is_verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Chưa xác thực
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Trạng thái hoạt động</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Hoạt động
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Số dư tài khoản</span>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(user?.balance || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {userStats && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Thống kê hoạt động
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{userStats.totalPosts}</div>
                          <div className="text-sm text-gray-600">Bài đăng</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{userStats.totalBookings}</div>
                          <div className="text-sm text-gray-600">Đặt phòng</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{userStats.totalTransactions}</div>
                          <div className="text-sm text-gray-600">Giao dịch</div>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">{userStats.averageRating.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Đánh giá TB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900">Hoạt động gần đây</h4>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : userActivity.length > 0 ? (
                  <div className="space-y-4">
                    {userActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date, true)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có hoạt động nào được ghi nhận</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Bài đăng của người dùng
                  </span>
                  <span className="text-sm text-gray-500">
                    ({userStats?.totalPosts || 0} bài đăng)
                  </span>
                </h4>
              </div>
              <div className="p-6">
                {userStats?.totalPosts ? (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">{userStats.totalPosts} bài đăng</p>
                    <p className="text-gray-500 mt-2">Chi tiết bài đăng sẽ được hiển thị ở đây</p>
                    <div className="mt-4">
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                        Xem tất cả bài đăng
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Người dùng chưa đăng bài nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Lịch sử giao dịch
                  </span>
                  <span className="text-sm text-gray-500">
                    ({userStats?.totalTransactions || 0} giao dịch)
                  </span>
                </h4>
              </div>
              <div className="p-6">
                {userStats?.totalTransactions ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">Tổng chi tiêu</p>
                          <p className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(userStats.totalSpent || 0)}
                          </p>
                        </div>
                        <BanknotesIcon className="h-12 w-12 text-green-400" />
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">Chi tiết giao dịch sẽ được hiển thị ở đây</p>
                      <button className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                        Xem lịch sử giao dịch
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có giao dịch nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Đánh giá và nhận xét
                  </span>
                  <span className="text-sm text-gray-500">
                    ({userStats?.totalReviews || 0} đánh giá)
                  </span>
                </h4>
              </div>
              <div className="p-6">
                {userStats?.totalReviews ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-amber-800">Đánh giá trung bình</p>
                          <div className="flex items-center">
                            <p className="text-2xl font-bold text-amber-600 mr-2">
                              {(userStats.averageRating || 0).toFixed(1)}
                            </p>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  className={`h-5 w-5 ${
                                    i < Math.floor(userStats.averageRating || 0) 
                                      ? 'fill-current' 
                                      : ''
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <StarIcon className="h-12 w-12 text-amber-400" />
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">Chi tiết đánh giá sẽ được hiển thị ở đây</p>
                      <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200">
                        Xem tất cả đánh giá
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có đánh giá nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {!['info', 'activity', 'posts', 'transactions', 'reviews'].includes(activeTab) && (
            <div className="text-center py-12">
              <div className="text-gray-500">Chức năng này đang được phát triển</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {formatDate(user?.last_login, true)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => user && onEdit(user)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Chỉnh sửa
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}