'use client';

import { useState, useEffect } from 'react';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon, CameraIcon, KeyIcon, CogIcon, HeartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ProfileShell from '@/components/profile/ProfileShell';
import { useSearchParams, useRouter } from 'next/navigation';
import ProfileChatLayout from '@/components/chat/ProfileChatLayout';
import RoleBadge from '@/components/ui/RoleBadge';
import { AuthRequired } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, userSettingsApi, savedPropertiesApi, rentalRequestApi } from '@/lib/api';
import axios from 'axios';
import { toastManager } from '@/components/ui/ToastManager';
import toast from 'react-hot-toast';

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
  const [rentalRequests, setRentalRequests] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  
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
  }, [searchParams]);

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
          toast.success(`🎉 Yêu cầu thuê phòng "${propertyTitle}" đã được chấp nhận!`, {
            duration: 6000,
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '500',
            },
          });
        } else if (status === 'rejected') {
          toast.error(`❌ Yêu cầu thuê phòng "${propertyTitle}" đã bị từ chối.`, {
            duration: 6000,
            style: {
              background: '#EF4444',
              color: '#fff',
              fontWeight: '500',
            },
          });
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
        setSavedProperties(savedResponse.data.items || []);
      }

      // Load rental requests
      const requestsResponse = await rentalRequestApi.getTenantRequests();
      if (requestsResponse.success) {
        setRentalRequests(requestsResponse.data.requests || []);
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

  // Test notification function
  const testNotification = async (type: 'accepted' | 'rejected') => {
    try {
      console.log(`🧪 Testing ${type} notification...`);
      
      // Get token
      const storedTokens = localStorage.getItem('auth_tokens');
      if (!storedTokens) {
        toast.error('Không tìm thấy token');
        return;
      }
      
      const tokenData = JSON.parse(storedTokens);
      const response = await axios.post(
        'http://localhost:5000/api/v1/test-notification/test-rental-notification',
        {
          type,
          propertyTitle: 'Phòng trọ test',
          propertyId: 'test123'
        },
        {
          headers: {
            'Authorization': `Bearer ${tokenData.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success(`🧪 Test notification sent: ${type}`);
        console.log('🧪 Test response:', response.data);
      }
    } catch (error) {
      console.error('🧪 Test notification error:', error);
      toast.error('Lỗi khi test notification');
    }
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
                    {authUser.avatar ? (
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
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
                    Tin đã lưu
                  </h3>
                  {savedProperties.length > 0 && (
                    <span className="text-sm text-gray-500">{savedProperties.length} tin đăng</span>
                  )}
                </div>
                {savedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedProperties.map((property: any) => (
                      <div key={property._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">{property.post?.roomId?.title || 'Không có tiêu đề'}</h4>
                          <HeartIcon className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0 ml-2" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-1">{property.post?.roomId?.address || 'Chưa có địa chỉ'}</p>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <p className="text-lg font-bold text-blue-600">{property.post?.roomId?.price?.toLocaleString() || '0'}đ</p>
                          <span className="text-xs text-gray-500">/tháng</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <HeartIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có tin nào được lưu</h4>
                    <p className="text-gray-500 mb-6">Bạn chưa lưu tin đăng nào. Hãy tìm kiếm và lưu những tin đăng yêu thích!</p>
                    <a href="/tim-kiem" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Tìm kiếm phòng trọ
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Rental Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Yêu cầu thuê phòng
                  </h3>
                  <div className="flex items-center space-x-4">
                    {rentalRequests.length > 0 && (
                      <span className="text-sm text-gray-500">{rentalRequests.length} yêu cầu</span>
                    )}
                    {/* Test buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => testNotification('accepted')}
                        className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        🧪 Test Accepted
                      </button>
                      <button
                        onClick={() => testNotification('rejected')}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        🧪 Test Rejected
                      </button>
                    </div>
                  </div>
                </div>
                {rentalRequests.length > 0 ? (
                  <div className="space-y-4">
                    {rentalRequests.map((request: any) => (
                      <div key={request._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{request.post?.roomId?.title || 'Không có tiêu đề'}</h4>
                              <span className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                request.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                                'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {request.status === 'pending' ? 'Chờ duyệt' :
                                 request.status === 'accepted' ? 'Đã duyệt' : 'Từ chối'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="text-sm">
                                <span className="text-gray-500">Địa chỉ:</span>
                                <p className="font-medium text-gray-900">{request.post?.roomId?.address || 'Chưa có địa chỉ'}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Giá thuê:</span>
                                <p className="font-medium text-blue-600">{request.post?.roomId?.price?.toLocaleString() || '0'}đ/tháng</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Số người:</span>
                                <p className="font-medium text-gray-900">{request.tenantInfo?.numberOfPeople || 1} người</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Dự kiến chuyển vào:</span>
                                <p className="font-medium text-gray-900">
                                  {request.expectedMoveIn ? new Date(request.expectedMoveIn).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-gray-500 text-sm">Tin nhắn:</span>
                              <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">{request.message}</p>
                            </div>
                            
                            {request.responseMessage && (
                              <div className="mb-3">
                                <span className="text-gray-500 text-sm">Phản hồi từ chủ nhà:</span>
                                <p className="text-sm text-gray-700 mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">{request.responseMessage}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Gửi lúc: {new Date(request.createdAt).toLocaleString('vi-VN')}
                              </div>
                              {request.respondedAt && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Phản hồi lúc: {new Date(request.respondedAt).toLocaleString('vi-VN')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu nào</h4>
                    <p className="text-gray-500 mb-6">Bạn chưa gửi yêu cầu thuê phòng nào. Hãy tìm kiếm phòng trọ phù hợp!</p>
                    <a href="/tim-kiem" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Tìm kiếm phòng trọ
                    </a>
                  </div>
                )}
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
