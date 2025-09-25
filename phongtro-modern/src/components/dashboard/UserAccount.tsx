'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  CameraIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

interface UserAccountData {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    newMessages: boolean;
    postUpdates: boolean;
    systemUpdates: boolean;
    rentalRequests: boolean;
    favoriteUpdates: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    allowMessages: boolean;
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
  };
  security: {
    twoFactor: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    requirePasswordForChanges: boolean;
  };
}

const defaultAccountData: UserAccountData = {
  profile: {
    name: '',
    email: '',
    phone: '',
    avatar: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    marketing: false,
    newMessages: true,
    postUpdates: true,
    systemUpdates: true,
    rentalRequests: true,
    favoriteUpdates: true
  },
  privacy: {
    showPhone: true,
    showEmail: false,
    allowMessages: true,
    showOnlineStatus: true,
    allowFriendRequests: true
  },
  security: {
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
    requirePasswordForChanges: true
  }
};

export default function UserAccount() {
  const { user: authUser, refreshUser } = useAuth();
  const [accountData, setAccountData] = useState<UserAccountData>(defaultAccountData);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'notifications', name: 'Thông báo', icon: BellIcon },
    { id: 'privacy', name: 'Quyền riêng tư', icon: ShieldCheckIcon },
    { id: 'security', name: 'Bảo mật', icon: KeyIcon }
  ];

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    
    // Set active tab based on current path
    const path = window.location.pathname;
    if (path.includes('/settings')) {
      setActiveTab('notifications'); // Default to notifications tab for settings page
    } else {
      setActiveTab('profile'); // Default to profile tab for profile page
    }
  }, [authUser]);

  // Fetch user data and settings from API
  const fetchUserData = async () => {
    if (!authUser) {
      setIsLoadingSettings(false);
      return;
    }

    try {
      // Fetch user profile and settings in parallel
      const [profileResponse, settingsResponse] = await Promise.all([
        authApi.getProfile(),
        authApi.getUserSettings()
      ]);
      
      // Get profile data from API response
      const profileData = profileResponse?.data || profileResponse;
      
      
      if (settingsResponse && settingsResponse.data) {
        const apiSettings = settingsResponse.data;
        setAccountData({
          profile: {
            name: profileData?.full_name || authUser.full_name || '',
            email: profileData?.email || authUser.email || '',
            phone: profileData?.phone || authUser.phone || '',
            avatar: profileData?.avatar?.url || (authUser as any)?.avatar?.url || (authUser as any)?.avatar || '',
            address: profileData?.address || (authUser as any)?.address || '',
            dateOfBirth: profileData?.dateOfBirth || (authUser as any)?.dateOfBirth || '',
            gender: profileData?.gender || (authUser as any)?.gender || ''
          },
          notifications: {
            email: apiSettings.notifications?.email ?? true,
            sms: apiSettings.notifications?.sms ?? false,
            push: apiSettings.notifications?.push ?? true,
            marketing: apiSettings.notifications?.marketing ?? false,
            newMessages: apiSettings.notifications?.newMessages ?? true,
            postUpdates: apiSettings.notifications?.postUpdates ?? true,
            systemUpdates: apiSettings.notifications?.systemUpdates ?? true,
            rentalRequests: apiSettings.notifications?.rentalRequests ?? true,
            favoriteUpdates: apiSettings.notifications?.favoriteUpdates ?? true
          },
          privacy: {
            showPhone: apiSettings.privacy?.showPhone ?? true,
            showEmail: apiSettings.privacy?.showEmail ?? false,
            allowMessages: apiSettings.privacy?.allowMessages ?? true,
            showOnlineStatus: apiSettings.privacy?.showOnlineStatus ?? true,
            allowFriendRequests: apiSettings.privacy?.allowFriendRequests ?? true
          },
          security: {
            twoFactor: apiSettings.security?.twoFactor ?? false,
            loginAlerts: apiSettings.security?.loginAlerts ?? true,
            sessionTimeout: apiSettings.security?.sessionTimeout ?? 30,
            requirePasswordForChanges: apiSettings.security?.requirePasswordForChanges ?? true
          }
        });
      } else {
        // Fallback to profile data from API or auth user data
        const profileData = profileResponse?.data || profileResponse;
        setAccountData(prev => ({
          ...prev,
          profile: {
            name: profileData?.full_name || authUser.full_name || '',
            email: profileData?.email || authUser.email || '',
            phone: profileData?.phone || authUser.phone || '',
            avatar: profileData?.avatar?.url || (authUser as any)?.avatar?.url || (authUser as any)?.avatar || '',
            address: profileData?.address || (authUser as any)?.address || '',
            dateOfBirth: profileData?.dateOfBirth || (authUser as any)?.dateOfBirth || '',
            gender: profileData?.gender || (authUser as any)?.gender || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Show specific error message for timeout
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Kết nối chậm. Vui lòng thử lại sau.');
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      }
      
      // Fallback to auth user data
      setAccountData(prev => ({
        ...prev,
        profile: {
          name: authUser.full_name || '',
          email: authUser.email || '',
          phone: authUser.phone || '',
          avatar: (authUser as any)?.avatar?.url || (authUser as any)?.avatar || '',
          address: (authUser as any)?.address || '',
          dateOfBirth: (authUser as any)?.dateOfBirth || '',
          gender: (authUser as any)?.gender || ''
        }
      }));
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!authUser) {
      toast.error('Vui lòng đăng nhập để lưu thông tin');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.updateProfile(accountData.profile);
      await refreshUser(); // Refresh auth context
      setIsEditingProfile(false);
      toast.success('Thông tin cá nhân đã được cập nhật thành công');
    } catch (error) {
      console.error('Error saving profile:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Kết nối chậm. Vui lòng thử lại sau.');
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thông tin cá nhân');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!authUser) {
      toast.error('Vui lòng đăng nhập để thay đổi mật khẩu');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowChangePassword(false);
      toast.success('Mật khẩu đã được thay đổi thành công');
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Kết nối chậm. Vui lòng thử lại sau.');
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Mật khẩu hiện tại không đúng');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification settings update
  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedData = {
      ...accountData,
      notifications: {
        ...accountData.notifications,
        [key]: value
      }
    };
    setAccountData(updatedData);

    try {
      await authApi.updateNotificationSettings(updatedData.notifications);
      toast.success('Cài đặt thông báo đã được cập nhật');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Kết nối chậm. Vui lòng thử lại sau.');
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật cài đặt thông báo');
      }
    }
  };

  // Handle privacy settings update
  const handlePrivacyChange = async (key: string, value: boolean) => {
    const updatedData = {
      ...accountData,
      privacy: {
        ...accountData.privacy,
        [key]: value
      }
    };
    setAccountData(updatedData);

    try {
      await authApi.updatePrivacySettings(updatedData.privacy);
      toast.success('Cài đặt riêng tư đã được cập nhật');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Kết nối chậm. Vui lòng thử lại sau.');
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật cài đặt riêng tư');
      }
    }
  };

  // Handle security settings update
  const handleSecurityChange = async (key: string, value: boolean | number) => {
    const updatedData = {
      ...accountData,
      security: {
        ...accountData.security,
        [key]: value
      }
    };
    setAccountData(updatedData);

    try {
      await authApi.updateSecuritySettings(updatedData.security);
      toast.success('Cài đặt bảo mật đã được cập nhật');
    } catch (error) {
      console.error('Error updating security settings:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Kết nối chậm. Vui lòng thử lại sau.');
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật cài đặt bảo mật');
      }
    }
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Vui lòng đăng nhập</h3>
          <p className="mt-1 text-sm text-gray-500">Đăng nhập để xem và quản lý thông tin tài khoản</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Tài khoản của tôi</h1>
          <p className="mt-1 text-sm text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoadingSettings ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Image
                        src={accountData.profile.avatar || '/placeholder-room.svg'}
                        alt={accountData.profile.name || 'User Avatar'}
                        width={100}
                        height={100}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                        <CameraIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{accountData.profile.name}</h2>
                      <p className="text-gray-600">{accountData.profile.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">Đã xác thực</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={accountData.profile.name}
                        onChange={(e) => setAccountData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={accountData.profile.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={accountData.profile.phone}
                        onChange={(e) => setAccountData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={accountData.profile.address}
                        onChange={(e) => setAccountData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, address: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={accountData.profile.dateOfBirth}
                        onChange={(e) => setAccountData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, dateOfBirth: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <select
                        value={accountData.profile.gender}
                        onChange={(e) => setAccountData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, gender: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                    {!isEditingProfile ? (
                      <>
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Chỉnh sửa thông tin
                        </button>
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Đổi mật khẩu
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingProfile(false);
                            fetchUserData(); // Reset data
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                  </div>

                  {/* Change Password Modal */}
                  {showChangePassword && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu hiện tại
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({
                                  ...prev,
                                  currentPassword: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showCurrentPassword ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu mới
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({
                                  ...prev,
                                  newPassword: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showNewPassword ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Xác nhận mật khẩu mới
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({
                                  ...prev,
                                  confirmPassword: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showConfirmPassword ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            onClick={() => setShowChangePassword(false)}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt thông báo</h3>
                    <p className="text-sm text-gray-600 mb-6">Chọn cách bạn muốn nhận thông báo</p>
                  </div>

                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">Email thông báo</h3>
                          <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">SMS thông báo</h3>
                          <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.notifications.sms}
                          onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BellIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">Push notification</h3>
                          <p className="text-sm text-gray-600">Thông báo trên trình duyệt</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.notifications.push}
                          onChange={(e) => handleNotificationChange('push', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Marketing Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">Email marketing</h3>
                          <p className="text-sm text-gray-600">Nhận thông tin khuyến mãi và sản phẩm mới</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.notifications.marketing}
                          onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt riêng tư</h3>
                    <p className="text-sm text-gray-600 mb-6">Kiểm soát thông tin cá nhân của bạn</p>
                  </div>

                  <div className="space-y-4">
                    {/* Show Phone */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Hiển thị số điện thoại</h3>
                        <p className="text-sm text-gray-600">Cho phép người khác xem số điện thoại của bạn</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.privacy.showPhone}
                          onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Show Email */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Hiển thị email</h3>
                        <p className="text-sm text-gray-600">Cho phép người khác xem email của bạn</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.privacy.showEmail}
                          onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Allow Messages */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Cho phép nhận tin nhắn</h3>
                        <p className="text-sm text-gray-600">Cho phép người khác gửi tin nhắn cho bạn</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.privacy.allowMessages}
                          onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt bảo mật</h3>
                    <p className="text-sm text-gray-600 mb-6">Bảo vệ tài khoản của bạn</p>
                  </div>

                  <div className="space-y-4">
                    {/* Two Factor Authentication */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Xác thực 2 yếu tố</h3>
                        <p className="text-sm text-gray-600">Bảo mật tài khoản với mã OTP</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.security.twoFactor}
                          onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Login Alerts */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Cảnh báo đăng nhập</h3>
                        <p className="text-sm text-gray-600">Nhận thông báo khi có đăng nhập mới</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountData.security.loginAlerts}
                          onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Session Timeout */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Thời gian phiên đăng nhập</h3>
                        <span className="text-sm text-gray-600">{accountData.security.sessionTimeout} phút</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Tự động đăng xuất sau thời gian không hoạt động</p>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={accountData.security.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5 phút</span>
                        <span>120 phút</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
