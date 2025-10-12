'use client';

import { useState, useEffect } from 'react';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon, CameraIcon, KeyIcon, CogIcon, HeartIcon, DocumentTextIcon, BellIcon } from '@heroicons/react/24/outline';
import ProfileShell from '@/components/profile/ProfileShell';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileChatLayout from '@/components/chat/ProfileChatLayout';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import RoleBadge from '@/components/ui/RoleBadge';
import SafeImage from '@/components/ui/SafeImage';
import { AuthRequired } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, userSettingsApi, savedPropertiesApi, rentalRequestApi } from '@/lib/api';
import axios from 'axios';
import { toastManager } from '@/components/ui/ToastManager';

export default function ProfilePage() {
  return (
    <AuthRequired>
      <ProfileShell>
        <ProfileContent />
      </ProfileShell>
    </AuthRequired>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'profile';
  const { user: authUser, refreshUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedProperties, setSavedProperties] = useState([]);
  const [filteredSavedProperties, setFilteredSavedProperties] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Rental requests filters
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [requestSortBy, setRequestSortBy] = useState('newest');
  const [filteredRentalRequests, setFilteredRentalRequests] = useState([]);
  
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (authUser) {
      setEditData({
        full_name: authUser.full_name || '',
        phone: authUser.phone || '',
        address: authUser.address || '',
        dateOfBirth: authUser.dateOfBirth || '',
        gender: authUser.gender || '',
        bio: authUser.bio || ''
      });
      loadUserData();
    }
  }, [authUser]);

  // Sync activeTab with URL query changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setActiveTab(tab);
    
    // Load data when switching to saved tab
    if (tab === 'saved' && authUser) {
      loadUserData();
    }
  }, [searchParams, authUser]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const notification = event.detail;
      console.log('🔔 Received notification in profile:', notification);
      console.log('🔔 Notification type:', notification.type);
      console.log('🔔 Notification metadata:', notification.metadata);
      
      // Handle rental request notifications
      if (notification.type === 'rental_request_update') {
        const { requestId, status, propertyTitle } = notification.metadata || {};
        console.log('🔔 Rental request notification details:', { requestId, status, propertyTitle });
        
        // Show toast notification
        if (status === 'accepted') {
          toastManager.showSuccess(`🎉 Yêu cầu thuê phòng "${propertyTitle}" đã được chấp nhận!`);
        } else if (status === 'rejected') {
          toastManager.showError(`❌ Yêu cầu thuê phòng "${propertyTitle}" đã bị từ chối.`);
        }
        
        // Reload rental requests if we're on the requests tab
        if (activeTab === 'requests') {
          console.log('🔔 Reloading rental requests data...');
          loadUserData();
        }
      }
    };

    console.log('🔔 Setting up notification listener in profile page');
    // Add event listener
    window.addEventListener('notification-received', handleNotification as EventListener);
    
    // Cleanup
    return () => {
      console.log('🔔 Cleaning up notification listener in profile page');
      window.removeEventListener('notification-received', handleNotification as EventListener);
    };
  }, [activeTab]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load saved properties
      const savedResponse = await savedPropertiesApi.getSavedProperties();
      if (savedResponse.success) {
        const properties = savedResponse.data.properties || [];
        setSavedProperties(properties);
        setFilteredSavedProperties(properties);
      }

      // Load rental requests
      const requestsResponse = await rentalRequestApi.getTenantRequests();
      if (requestsResponse.success) {
        const requests = requestsResponse.data.requests || [];
        setRentalRequests(requests);
        setFilteredRentalRequests(requests);
      }

      // Load user settings
      const settingsResponse = await userSettingsApi.get();
      if (settingsResponse.success) {
        setUserSettings(settingsResponse.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.updateProfile(editData);
      
      if (response.success) {
        toastManager.showSuccess('Cập nhật thông tin thành công');
        await refreshUser(); // Refresh user data
    setIsEditing(false);
      } else {
        toastManager.showError(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toastManager.showError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastManager.showError('Mật khẩu mới không khớp');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        toastManager.showSuccess('Đổi mật khẩu thành công');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toastManager.showError(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toastManager.showError('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await authApi.uploadAvatar(formData);
      
      if (response.success) {
        toastManager.showSuccess('Cập nhật ảnh đại diện thành công');
        await refreshUser(); // Refresh user data
      } else {
        toastManager.showError(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toastManager.showError('Có lỗi xảy ra khi cập nhật ảnh đại diện');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toastManager.showSuccess('Đã đăng xuất thành công', {
        description: 'Hẹn gặp lại bạn!'
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toastManager.showError('Có lỗi khi đăng xuất');
    }
  };

  const handleViewProperty = (property: any) => {
    if (property.postId) {
      router.push(`/phong-tro/${property.postId}`);
    } else {
      toastManager.showError('Không thể xem chi tiết tin đăng này');
    }
  };

  const handleViewPostDetails = (post: any) => {
    const postId = post?.roomId?._id || post?._id;
    if (postId) {
      router.push(`/phong-tro/${postId}`);
    } else {
      toastManager.showError('Không thể xem chi tiết tin đăng này');
    }
  };

  const handleMessageLandlord = (landlordId: string) => {
    if (landlordId) {
      // Navigate to chat page with the landlord
      router.push(`/chat?userId=${landlordId}`);
    } else {
      toastManager.showError('Không tìm thấy thông tin chủ nhà để nhắn tin');
    }
  };


  const handleRemoveSaved = async (property: any) => {
    try {
      const response = await savedPropertiesApi.removeProperty(property.id || property._id);
      if (response.success) {
        toastManager.showSuccess('Đã bỏ lưu tin đăng');
        // Reload saved properties
        loadUserData();
      } else {
        toastManager.showError(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error removing saved property:', error);
      toastManager.showError('Có lỗi xảy ra khi bỏ lưu tin đăng');
    }
  };

  // Filter and search saved properties
  useEffect(() => {
    let filtered = [...savedProperties];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedDate || 0).getTime() - new Date(a.savedDate || 0).getTime();
        case 'oldest':
          return new Date(a.savedDate || 0).getTime() - new Date(b.savedDate || 0).getTime();
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    setFilteredSavedProperties(filtered);
  }, [savedProperties, searchTerm, statusFilter, sortBy]);

  // Filter and search rental requests
  useEffect(() => {
    let filtered = [...rentalRequests];

    // Apply search filter
    if (requestSearchTerm) {
      filtered = filtered.filter(request => 
        request.post?.roomId?.title?.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
        request.post?.roomId?.address?.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
        request.message?.toLowerCase().includes(requestSearchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (requestStatusFilter) {
      filtered = filtered.filter(request => request.status === requestStatusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (requestSortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredRentalRequests(filtered);
  }, [rentalRequests, requestSearchTerm, requestStatusFilter, requestSortBy]);

  const handleCancel = () => {
    if (authUser) {
      setEditData({
        full_name: authUser.full_name || '',
        phone: authUser.phone || '',
        address: authUser.address || '',
        dateOfBirth: authUser.dateOfBirth || '',
        gender: authUser.gender || '',
        bio: authUser.bio || ''
      });
    }
    setIsEditing(false);
  };


  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow-sm rounded-xl mb-6 overflow-hidden border border-gray-200">
            <div className="p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <div className="h-28 w-28 bg-gray-100 rounded-full flex items-center justify-center ring-4 ring-gray-50 shadow-md">
                    {authUser.avatar && (typeof authUser.avatar === 'string' ? authUser.avatar.trim() !== '' : authUser.avatar.url && authUser.avatar.url.trim() !== '') ? (
                      <img
                        src={typeof authUser.avatar === 'string' ? authUser.avatar : authUser.avatar.url}
                        alt="Avatar"
                        className="h-28 w-28 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-14 w-14 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2.5 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <CameraIcon className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{authUser.full_name}</h2>
                  <p className="text-gray-600 mt-1">{authUser.email}</p>
                  <div className="mt-3 flex items-center justify-center sm:justify-start space-x-3">
                    <RoleBadge role={authUser.role} size="md" />
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`bg-white shadow-sm rounded-xl border border-gray-200 ${activeTab === 'chat' ? '' : 'p-6 lg:p-8'}`}>
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="p-6">
              <ProfileChatLayout />
            </div>
          )}
          
          {activeTab !== 'chat' && (
            <div>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin cá nhân
                  </h3>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={editData.full_name}
                          onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          value={editData.address}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Nhập địa chỉ"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={editData.dateOfBirth}
                          onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Giới tính
                        </label>
                        <select
                          value={editData.gender}
                          onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Giới thiệu bản thân
                        </label>
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                          placeholder="Viết vài dòng giới thiệu về bản thân..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Họ và tên
                        </label>
                        <p className="text-gray-900 font-medium">{authUser.full_name || 'Chưa cập nhật'}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium">{authUser.email}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Số điện thoại
                        </label>
                        <p className="text-gray-900 font-medium">{authUser.phone || 'Chưa cập nhật'}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Vai trò
                        </label>
                        <RoleBadge role={authUser.role} size="md" />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Địa chỉ
                        </label>
                        <p className="text-gray-900 font-medium">{authUser.address || 'Chưa cập nhật'}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                          Ngày sinh
                        </label>
                        <p className="text-gray-900 font-medium">{authUser.dateOfBirth || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Saved Properties Tab */}
            {activeTab === 'saved' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-50 rounded-lg mr-3">
                      <HeartIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Tin đã lưu</h3>
                      <p className="text-sm text-gray-500">Danh sách các tin đăng bạn đã lưu</p>
                    </div>
                  </div>
                  {savedProperties.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {filteredSavedProperties.length} / {savedProperties.length} tin đăng
                      </span>
                    </div>
                  )}
                </div>
                
                {savedProperties.length > 0 ? (
                  <div className="space-y-4">
                    {/* Search and Filter Bar */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Tìm kiếm trong tin đã lưu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Tất cả</option>
                            <option value="active">Đang cho thuê</option>
                            <option value="rented">Đã cho thuê</option>
                          </select>
                          <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="price_low">Giá thấp</option>
                            <option value="price_high">Giá cao</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Properties Grid */}
                    {filteredSavedProperties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredSavedProperties.map((property: any) => (
                        <div key={property.id || property._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300 group property-card">
                          {/* Property Image */}
                          <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <SafeImage
                              src={property.images}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300 property-image"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            
                            {/* Status Badge */}
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                property.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {property.status === 'active' ? 'Đang cho thuê' : 'Không khả dụng'}
                              </span>
                            </div>
                            
                            {/* Favorite Button */}
                            <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                              <HeartIcon className="w-5 h-5 text-red-500 fill-red-500" />
                            </button>
                          </div>

                          {/* Property Details */}
                          <div className="p-5">
                            <div className="mb-3">
                              <Link href={`/phong-tro/${property.postId || property.post || property.id || property._id}`}>
                                <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer hover:underline">
                                  {property.title || 'Không có tiêu đề'}
                                </h4>
                              </Link>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="line-clamp-1">{property.address || 'Chưa có địa chỉ'}</span>
                              </div>
                            </div>

                            {/* Price and Area */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-xl font-bold text-blue-600">
                                  {property.price?.toLocaleString() || '0'}₫
                                </p>
                                <p className="text-xs text-gray-500">/tháng</p>
                              </div>
                              {property.area && (
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">{property.area}m²</p>
                                  <p className="text-xs text-gray-500">Diện tích</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleViewProperty(property)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              <button 
                                onClick={() => handleRemoveSaved(property)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                              >
                                Bỏ lưu
                              </button>
                            </div>

                            {/* Saved Date */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                Đã lưu: {property.savedDate ? new Date(property.savedDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                              </p>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                    </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h4>
                        <p className="text-gray-500 mb-4">Không có tin đăng nào phù hợp với bộ lọc của bạn.</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                            setSortBy('newest');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    )}

                    {/* Load More Button */}
                    {filteredSavedProperties.length > 0 && (
                      <div className="text-center pt-6">
                        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                          Xem thêm tin đã lưu
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
                      <HeartIcon className="w-10 h-10 text-red-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Chưa có tin nào được lưu</h4>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Bạn chưa lưu tin đăng nào. Hãy khám phá và lưu những tin đăng phù hợp với nhu cầu của bạn!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a 
                        href="/tim-kiem" 
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      Tìm kiếm phòng trọ
                    </a>
                      <a 
                        href="/phong-tro" 
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Xem tất cả tin đăng
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rental Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Yêu cầu thuê phòng</h3>
                      <p className="text-sm text-gray-500">Danh sách các yêu cầu thuê phòng bạn đã gửi</p>
                    </div>
                  </div>
                    {rentalRequests.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {filteredRentalRequests.length} / {rentalRequests.length} yêu cầu
                      </span>
                    </div>
                  )}
                </div>
                {rentalRequests.length > 0 ? (
                  <div className="space-y-4">
                    {/* Search and Filter Bar */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Tìm kiếm yêu cầu thuê..."
                            value={requestSearchTerm}
                            onChange={(e) => setRequestSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={requestStatusFilter}
                            onChange={(e) => setRequestStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="accepted">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                          </select>
                          <select 
                            value={requestSortBy}
                            onChange={(e) => setRequestSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="status">Theo trạng thái</option>
                          </select>
                    </div>
                  </div>
                </div>

                    {/* Requests List */}
                    {filteredRentalRequests.length > 0 ? (
                  <div className="space-y-4">
                        {filteredRentalRequests.map((request: any) => (
                          <div key={request._id || request.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300 property-card">
                            <div className="p-6">
                              {/* Header with title and status */}
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    {request.post?.roomId?.title || 'Không có tiêu đề'}
                                  </h4>
                                  <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{request.post?.roomId?.address || 'Chưa có địa chỉ'}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-2">
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                request.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                                'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {request.status === 'pending' ? 'Chờ duyệt' :
                                 request.status === 'accepted' ? 'Đã duyệt' : 'Từ chối'}
                              </span>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-blue-600">
                                      {request.post?.roomId?.price?.toLocaleString() || '0'}₫
                                    </p>
                                    <p className="text-sm text-gray-500">/tháng</p>
                                  </div>
                                </div>
                            </div>
                            
                              {/* Request Info Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center mb-1">
                                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Số người</span>
                              </div>
                                  <p className="text-sm text-gray-900">{request.tenantInfo?.numberOfPeople || 1} người</p>
                              </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center mb-1">
                                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Dự kiến chuyển vào</span>
                              </div>
                                  <p className="text-sm text-gray-900">
                                  {request.expectedMoveIn ? new Date(request.expectedMoveIn).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                </p>
                              </div>
                            </div>
                            
                              {/* Message */}
                              <div className="mb-4">
                                <div className="flex items-center mb-2">
                                  <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">Tin nhắn của bạn</span>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-gray-700">{request.message}</p>
                                </div>
                            </div>
                            
                              {/* Response Message */}
                            {request.responseMessage && (
                                <div className="mb-4">
                                  <div className="flex items-center mb-2">
                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Phản hồi từ chủ nhà</span>
                                  </div>
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-700">{request.responseMessage}</p>
                                  </div>
                              </div>
                            )}
                            
                              {/* Action Buttons */}
                              <div className="flex gap-3 mb-4">
                                <button
                                  onClick={() => handleViewPostDetails(request.post)}
                                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Xem chi tiết phòng
                                </button>
                                <button
                                  onClick={() => handleMessageLandlord(request.post?.landlord?._id || request.post?.landlord)}
                                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  Nhắn tin với chủ phòng
                                </button>
                              </div>

                              {/* Timestamps */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Gửi lúc: {new Date(request.createdAt).toLocaleString('vi-VN')}
                              </div>
                              {request.respondedAt && (
                                  <div className="flex items-center text-xs text-gray-500">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Phản hồi lúc: {new Date(request.respondedAt).toLocaleString('vi-VN')}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                    </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy yêu cầu</h4>
                        <p className="text-gray-500 mb-4">Không có yêu cầu nào phù hợp với bộ lọc của bạn.</p>
                        <button 
                          onClick={() => {
                            setRequestSearchTerm('');
                            setRequestStatusFilter('');
                            setRequestSortBy('newest');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                      <DocumentTextIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Chưa có yêu cầu nào</h4>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Bạn chưa gửi yêu cầu thuê phòng nào. Hãy khám phá và gửi yêu cầu cho những phòng trọ phù hợp!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a 
                        href="/tim-kiem" 
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      Tìm kiếm phòng trọ
                    </a>
                      <a 
                        href="/phong-tro" 
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Xem tất cả tin đăng
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <BellIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Thông báo</h3>
                      <p className="text-sm text-gray-500">Trung tâm thông báo - theo dõi tất cả hoạt động và cập nhật</p>
                    </div>
                  </div>
                </div>
                <NotificationCenter />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <CogIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Cài đặt tài khoản
                </h3>
                {userSettings ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Thông báo email</h4>
                          <p className="text-sm text-gray-600">Cài đặt thông báo sẽ được cập nhật sớm</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Thông tin</h4>
                          <p className="text-sm text-gray-600">Nhiều tính năng cài đặt sẽ được bổ sung trong các phiên bản tiếp theo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải cài đặt...</p>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <KeyIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Bảo mật tài khoản
                </h3>
                <div className="max-w-2xl">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-900 mb-1">Lưu ý bảo mật</h4>
                        <p className="text-sm text-yellow-800">Mật khẩu mới nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang đổi...
                          </span>
                        ) : 'Đổi mật khẩu'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
