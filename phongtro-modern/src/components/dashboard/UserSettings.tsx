'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, userSettingsApi } from '@/lib/api';

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'security';

interface SettingsState {
  profile: {
    full_name: string;
    email: string;
    phone: string;
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

const defaultSettings: SettingsState = {
  profile: {
    full_name: '',
    email: '',
    phone: '',
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
    favoriteUpdates: true,
  },
  privacy: {
    showPhone: true,
    showEmail: false,
    allowMessages: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
  },
  security: {
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
    requirePasswordForChanges: true,
  },
};

export default function UserSettings() {
  const { user: authUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = useMemo(
    () => ([
      { id: 'profile', name: 'Thông tin cá nhân', icon: UserIcon },
      { id: 'notifications', name: 'Thông báo', icon: BellIcon },
      { id: 'privacy', name: 'Quyền riêng tư', icon: ShieldCheckIcon },
      { id: 'security', name: 'Bảo mật', icon: KeyIcon },
    ] as { id: SettingsTab; name: string; icon: any }[]),
    []
  );

  useEffect(() => {
    const loadSettings = async () => {
      if (!authUser) return;
      setIsLoading(true);

      try {
        const response = await userSettingsApi.get();
        const fetched = (response.data || response) as any;

        const profile = {
          full_name: authUser.full_name || '',
          email: fetched?.user?.email || authUser.email || '',
          phone: fetched?.user?.phone || authUser.phone || '',
        };

        setSettings({
          profile,
          notifications: {
            ...defaultSettings.notifications,
            ...(fetched.notifications || {}),
          },
          privacy: {
            ...defaultSettings.privacy,
            ...(fetched.privacy || {}),
          },
          security: {
            ...defaultSettings.security,
            ...(fetched.security || {}),
          },
        });
      } catch (error) {
        console.error('Error loading user settings:', error);
        toastManager.showError('Không thể tải cài đặt người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [authUser]);

  const handleSaveProfile = async () => {
    if (!authUser) {
      toastManager.showError('Vui lòng đăng nhập để lưu thông tin');
      return;
    }

    setIsSaving(true);
    try {
      await userSettingsApi.update({ profile: settings.profile });
      await refreshUser();
      toastManager.showSuccess('Cập nhật thông tin cá nhân thành công');
    } catch (error) {
      console.error('Error saving profile:', error);
      toastManager.showError('Không thể lưu thông tin cá nhân');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await userSettingsApi.updateNotifications(settings.notifications);
      toastManager.showSuccess('Đã lưu cài đặt thông báo');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toastManager.showError('Không thể cập nhật cài đặt thông báo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      await userSettingsApi.updatePrivacy(settings.privacy);
      toastManager.showSuccess('Đã lưu cài đặt quyền riêng tư');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toastManager.showError('Không thể cập nhật cài đặt quyền riêng tư');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurityPreferences = async () => {
    setIsSaving(true);
    try {
      await userSettingsApi.updateSecurity(settings.security);
      toastManager.showSuccess('Đã lưu cài đặt bảo mật');
    } catch (error) {
      console.error('Error updating security settings:', error);
      toastManager.showError('Không thể cập nhật cài đặt bảo mật');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCurrentTab = () => {
    switch (activeTab) {
      case 'profile':
        return handleSaveProfile();
      case 'notifications':
        return handleSaveNotifications();
      case 'privacy':
        return handleSavePrivacy();
      case 'security':
        return handleSaveSecurityPreferences();
      default:
        return Promise.resolve();
    }
  };

  const handleChangePassword = async () => {
    if (!authUser) {
      toastManager.showError('Vui lòng đăng nhập để thay đổi mật khẩu');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastManager.showError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toastManager.showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if ((response as any).success !== false) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        toastManager.showSuccess('Mật khẩu đã được thay đổi thành công');
      } else {
        toastManager.showError(response.message || 'Mật khẩu hiện tại không đúng');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toastManager.showError('Có lỗi xảy ra khi thay đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <div className="text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem cài đặt tài khoản</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 mt-8 lg:mt-0">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={settings.profile.full_name}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, full_name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cài đặt thông báo</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Email thông báo</h3>
                        <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">SMS thông báo</h3>
                        <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, sms: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Push notification</h3>
                        <p className="text-sm text-gray-600">Thông báo trên trình duyệt</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quyền riêng tư</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Hiển thị số điện thoại</h3>
                        <p className="text-sm text-gray-600">Cho phép người khác xem số điện thoại của bạn</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showPhone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showPhone: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Hiển thị email</h3>
                        <p className="text-sm text-gray-600">Cho phép người khác xem email của bạn</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showEmail}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showEmail: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h2>
                
                {/* Change Password */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thay đổi mật khẩu</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
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
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
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
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
                    </button>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt bảo mật</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Xác thực 2 yếu tố</h3>
                          <p className="text-sm text-gray-600">Bảo mật tài khoản với mã OTP</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactor}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, twoFactor: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Cảnh báo đăng nhập</h3>
                          <p className="text-sm text-gray-600">Nhận thông báo khi có đăng nhập mới</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.loginAlerts}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, loginAlerts: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveCurrentTab}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
