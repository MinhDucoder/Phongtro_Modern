'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  CogIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon as EyeOpenIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, userSettingsApi } from '@/lib/api';

type SettingsTab = 'account' | 'security' | 'privacy' | 'notifications' | 'preferences';

interface ConsolidatedSettingsState {
  account: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    bio: string;
    avatar: string;
    timezone: string;
    language: string;
  };
  security: {
    changePassword: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    requirePasswordForChanges: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    allowMessages: boolean;
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    shareUsageData: boolean;
    marketingConsent: boolean;
  };
  notifications: {
    email: {
      newMessages: boolean;
      rentalRequests: boolean;
      postUpdates: boolean;
      systemUpdates: boolean;
      promotionalEmails: boolean;
    };
    push: {
      browser: boolean;
      mobile: boolean;
      desktop: boolean;
    };
    sms: {
      enabled: boolean;
      verificationCodes: boolean;
      urgentAlerts: boolean;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    animationsEnabled: boolean;
    defaultView: string;
    itemsPerPage: number;
    autoRefresh: boolean;
  };
}

const defaultSettings: ConsolidatedSettingsState = {
  account: {
    full_name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    avatar: '',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
  },
  security: {
    changePassword: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    requirePasswordForChanges: true,
  },
  privacy: {
    showPhone: true,
    showEmail: false,
    allowMessages: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
    shareUsageData: false,
    marketingConsent: false,
  },
  notifications: {
    email: {
      newMessages: true,
      rentalRequests: true,
      postUpdates: true,
      systemUpdates: true,
      promotionalEmails: false,
    },
    push: {
      browser: true,
      mobile: true,
      desktop: true,
    },
    sms: {
      enabled: false,
      verificationCodes: true,
      urgentAlerts: true,
    },
  },
  preferences: {
    theme: 'light',
    compactMode: false,
    animationsEnabled: true,
    defaultView: 'dashboard',
    itemsPerPage: 10,
    autoRefresh: true,
  },
};

export default function ConsolidatedSettings() {
  const { user: authUser, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as SettingsTab) || 'account';
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [settings, setSettings] = useState<ConsolidatedSettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const tabs = useMemo(() => [
    {
      id: 'account' as SettingsTab,
      name: 'Tài khoản',
      icon: UserIcon,
      description: 'Thông tin cá nhân và tài khoản'
    },
    {
      id: 'security' as SettingsTab,
      name: 'Bảo mật',
      icon: ShieldCheckIcon,
      description: 'Mật khẩu và bảo mật tài khoản'
    },
    {
      id: 'privacy' as SettingsTab,
      name: 'Quyền riêng tư',
      icon: EyeIcon,
      description: 'Kiểm soát thông tin hiển thị'
    },
    {
      id: 'notifications' as SettingsTab,
      name: 'Thông báo',
      icon: BellIcon,
      description: 'Cài đặt thông báo và liên lạc'
    },
    {
      id: 'preferences' as SettingsTab,
      name: 'Tùy chọn',
      icon: CogIcon,
      description: 'Giao diện và trải nghiệm'
    },
  ], []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [authUser]);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  const loadSettings = async () => {
    if (!authUser) return;

    try {
      setIsLoading(true);
      
      // Load profile data
      const profileResponse = await authApi.getProfile();
      if (profileResponse.success !== false && profileResponse) {
        const userData = profileResponse.data || profileResponse;
        setSettings(prev => ({
          ...prev,
          account: {
            ...prev.account,
            full_name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
            gender: userData.gender || '',
            bio: userData.bio || '',
            avatar: userData.avatar || '',
          }
        }));
      }

      // TODO: Load other settings from userSettingsApi
      // const settingsResponse = await userSettingsApi.getUserSettings();
      // if (settingsResponse.success && settingsResponse.data) {
      //   setSettings(prev => ({ ...prev, ...settingsResponse.data }));
      // }

    } catch (error) {
      console.error('Error loading settings:', error);
      toastManager.showError('Không thể tải cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastManager.showError('Vui lòng chọn file ảnh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastManager.showError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    try {
      setIsUploadingAvatar(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      // Upload avatar
      const response = await authApi.uploadAvatar(formData);
      
      if (response.success === false) {
        throw new Error(response.message || 'Upload ảnh đại diện thất bại');
      }
      
      // Update settings with new avatar URL
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          avatar: response.data?.avatar || response.avatar || ''
        }
      }));
      
      // Clear file and preview
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh user data
      await refreshUser();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      toastManager.showSuccess('Cập nhật ảnh đại diện thành công');
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toastManager.showError(error.message || 'Có lỗi xảy ra khi upload ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      
      const response = await authApi.removeAvatar();
      
      if (response.success === false) {
        throw new Error(response.message || 'Xóa ảnh đại diện thất bại');
      }
      
      // Update settings
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          avatar: ''
        }
      }));
      
      // Refresh user data
      await refreshUser();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      toastManager.showSuccess('Xóa ảnh đại diện thành công');
      
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toastManager.showError(error.message || 'Có lỗi xảy ra khi xóa ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (section?: SettingsTab) => {
    const sectionsToSave = section ? [section] : ['account', 'security', 'privacy', 'notifications', 'preferences'];
    
    try {
      setIsSaving(true);

      for (const sectionKey of sectionsToSave) {
        switch (sectionKey) {
          case 'account':
            // Validate required fields
            if (!settings.account.full_name.trim()) {
              toastManager.showError('Họ và tên không được để trống');
              return;
            }
            
            const profileResponse = await authApi.updateProfile({
              full_name: settings.account.full_name,
              phone: settings.account.phone,
              address: settings.account.address,
              dateOfBirth: settings.account.dateOfBirth,
              gender: settings.account.gender,
              bio: settings.account.bio,
            });
            
            if (profileResponse.success === false) {
              throw new Error(profileResponse.message || 'Cập nhật thông tin thất bại');
            }
            
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('profile-updated'));
            break;

          case 'security':
            if (settings.security.changePassword.newPassword) {
              await authApi.changePassword({
                oldPassword: settings.security.changePassword.currentPassword,
                newPassword: settings.security.changePassword.newPassword,
              });
              // Clear password fields after successful change
              setSettings(prev => ({
                ...prev,
                security: {
                  ...prev.security,
                  changePassword: {
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }
                }
              }));
            }
            break;

          // TODO: Implement other sections
          case 'privacy':
          case 'notifications':
          case 'preferences':
            // await userSettingsApi.updateSection(sectionKey, settings[sectionKey]);
            break;
        }
      }

      await refreshUser();
      setHasChanges(false);
      toastManager.showSuccess('Cập nhật cài đặt thành công');

    } catch (error) {
      console.error('Error saving settings:', error);
      toastManager.showError('Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordValidation = () => {
    const { currentPassword, newPassword, confirmPassword } = settings.security.changePassword;
    
    if (!currentPassword) {
      toastManager.showError('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    
    if (newPassword.length < 6) {
      toastManager.showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      toastManager.showError('Mật khẩu xác nhận không khớp');
      return false;
    }
    
    return true;
  };

  const handleAccountChange = (field: keyof ConsolidatedSettingsState['account'], value: string) => {
    setSettings(prev => ({
      ...prev,
      account: { ...prev.account, [field]: value }
    }));
    setHasChanges(true);
  };

  const handlePasswordChange = (field: keyof ConsolidatedSettingsState['security']['changePassword'], value: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        changePassword: { ...prev.security.changePassword, [field]: value }
      }
    }));
    setHasChanges(true);
  };

  const toggleSetting = (section: keyof ConsolidatedSettingsState, field: string, subfield?: string) => {
    setSettings(prev => {
      if (subfield) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...(prev[section] as any)[field],
              [subfield]: !(prev[section] as any)[field][subfield]
            }
          }
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: !(prev[section] as any)[field]
          }
        };
      }
    });
    setHasChanges(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin tài khoản</h2>
              
              {/* Avatar Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ảnh đại diện
                </label>
                <div className="flex items-center space-x-6">
                  {/* Current Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {settings.account.avatar || avatarPreview ? (
                        <img
                          src={avatarPreview || settings.account.avatar}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <CameraIcon className="w-4 h-4 mr-2" />
                          {avatarFile ? 'Chọn ảnh khác' : 'Chọn ảnh đại diện'}
                        </label>
                      </div>
                      
                      {avatarFile && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isUploadingAvatar ? 'Đang upload...' : 'Upload ảnh'}
                          </button>
                          <button
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                      
                      {settings.account.avatar && !avatarFile && (
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                        >
                          Xóa ảnh đại diện
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={settings.account.full_name}
                    onChange={(e) => handleAccountChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.account.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={settings.account.phone}
                    onChange={(e) => handleAccountChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    value={settings.account.gender}
                    onChange={(e) => handleAccountChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={settings.account.address}
                    onChange={(e) => handleAccountChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={settings.account.dateOfBirth}
                    onChange={(e) => handleAccountChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={settings.account.bio}
                    onChange={(e) => handleAccountChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h2>
              
              {/* Change Password */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <KeyIcon className="w-5 h-5 mr-2" />
                  Thay đổi mật khẩu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={settings.security.changePassword.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeOpenIcon className="h-5 w-5 text-gray-400" />
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
                        value={settings.security.changePassword.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeOpenIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={settings.security.changePassword.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Xác nhận mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeOpenIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (handlePasswordValidation()) {
                      handleSave('security');
                    }
                  }}
                  disabled={!settings.security.changePassword.currentPassword || !settings.security.changePassword.newPassword}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  Thay đổi mật khẩu
                </button>
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Cài đặt bảo mật</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Xác thực hai yếu tố (2FA)</h4>
                      <p className="text-sm text-gray-600">Thêm lớp bảo mật cho tài khoản</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={() => toggleSetting('security', 'twoFactorAuth')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Thông báo đăng nhập</h4>
                      <p className="text-sm text-gray-600">Nhận thông báo khi có đăng nhập mới</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={() => toggleSetting('security', 'loginAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quyền riêng tư</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Hiển thị số điện thoại</h3>
                      <p className="text-sm text-gray-600">Cho phép người khác xem số điện thoại</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showPhone}
                      onChange={() => toggleSetting('privacy', 'showPhone')}
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
                      <p className="text-sm text-gray-600">Cho phép người khác xem email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showEmail}
                      onChange={() => toggleSetting('privacy', 'showEmail')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Cho phép tin nhắn</h3>
                      <p className="text-sm text-gray-600">Nhận tin nhắn từ người dùng khác</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.allowMessages}
                      onChange={() => toggleSetting('privacy', 'allowMessages')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cài đặt thông báo</h2>
              
              {/* Email Notifications */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo qua Email</h3>
                <div className="space-y-4">
                  {Object.entries(settings.notifications.email).map(([key, value]) => {
                    const labels = {
                      newMessages: 'Tin nhắn mới',
                      rentalRequests: 'Yêu cầu thuê phòng',
                      postUpdates: 'Cập nhật tin đăng',
                      systemUpdates: 'Cập nhật hệ thống',
                      promotionalEmails: 'Email khuyến mãi'
                    };
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{labels[key as keyof typeof labels]}</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => toggleSetting('notifications', 'email', key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo đẩy</h3>
                <div className="space-y-4">
                  {Object.entries(settings.notifications.push).map(([key, value]) => {
                    const labels = {
                      browser: 'Trình duyệt',
                      mobile: 'Điện thoại',
                      desktop: 'Máy tính'
                    };
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{labels[key as keyof typeof labels]}</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => toggleSetting('notifications', 'push', key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tùy chọn hiển thị</h2>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Giao diện</h4>
                  <select
                    value={settings.preferences.theme}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                    <option value="auto">Tự động</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Chế độ compact</h4>
                    <p className="text-sm text-gray-600">Hiển thị gọn gàng hơn</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.preferences.compactMode}
                      onChange={() => toggleSetting('preferences', 'compactMode')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Hiệu ứng động</h4>
                    <p className="text-sm text-gray-600">Bật/tắt các hiệu ứng chuyển động</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.preferences.animationsEnabled}
                      onChange={() => toggleSetting('preferences', 'animationsEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {renderTabContent()}
            
            {/* Save Button */}
            {hasChanges && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-600">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">Bạn có thay đổi chưa được lưu</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        loadSettings();
                        setHasChanges(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={isSaving}
                    >
                      Hủy thay đổi
                    </button>
                    <button
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
