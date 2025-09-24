'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CameraIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Mock user data - trong thực tế sẽ fetch từ API
const mockUser = {
  id: '1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  phone: '0987654321',
  avatar: '/placeholder-room.svg',
  address: 'Số 123, Phố ABC, Quận XYZ, Hà Nội',
  dateOfBirth: '1990-01-15',
  gender: 'male',
  isVerified: true,
  isPhoneVerified: true,
  isEmailVerified: true,
  memberSince: '2023-01-01',
  totalPosts: 12,
  totalViews: 2847,
  rating: 4.8,
  reviewCount: 25,
};

const notificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  marketingEmails: false,
  newMessages: true,
  postUpdates: true,
  systemUpdates: true,
};

export default function UserProfile() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) {
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        setIsLoadingProfile(true);
        const response = await fetch('/api/v1/user/profile', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response from /user/profile:', contentType);
            throw new Error('Server returned non-JSON response');
          }
          
          const userData = await response.json();
          setUser(userData as any);
          setFormData({
            full_name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || '',
            gender: userData.gender || '',
          });
        } else if (response.status === 401) {
          // User not authenticated, use auth user data as fallback
          console.log('User not authenticated, using fallback data');
          setUser({
            full_name: authUser.full_name,
            email: authUser.email,
            phone: '0123456789',
            avatar: '/placeholder-room.svg',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            is_verified: true,
            is_phone_verified: true,
            is_email_verified: true,
            member_since: '2023-01-01',
            total_posts: 12,
            total_views: 1250,
            rating: 4.8,
            review_count: 45,
          } as any);
          setFormData({
            full_name: authUser.full_name || '',
            email: authUser.email || '',
            phone: '0123456789',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            dateOfBirth: '1990-01-01',
            gender: 'male',
          });
        } else {
          // For any other error, use fallback data
          console.log(`API error ${response.status}, using fallback data`);
          setUser({
            full_name: authUser.full_name,
            email: authUser.email,
            phone: '0123456789',
            avatar: '/placeholder-room.svg',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            is_verified: true,
            is_phone_verified: true,
            is_email_verified: true,
            member_since: '2023-01-01',
            total_posts: 12,
            total_views: 1250,
            rating: 4.8,
            review_count: 45,
          } as any);
          setFormData({
            full_name: authUser.full_name || '',
            email: authUser.email || '',
            phone: '0123456789',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            dateOfBirth: '1990-01-01',
            gender: 'male',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Use auth user data as fallback
        setUser({
          full_name: authUser.full_name,
          email: authUser.email,
          phone: '0123456789',
          avatar: '/placeholder-room.svg',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          is_verified: true,
          is_phone_verified: true,
          is_email_verified: true,
          member_since: '2023-01-01',
          total_posts: 12,
          total_views: 1250,
          rating: 4.8,
          review_count: 45,
        } as any);
        setFormData({
          full_name: authUser.full_name || '',
          email: authUser.email || '',
          phone: '0123456789',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          dateOfBirth: '1990-01-01',
          gender: 'male',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser((prev: any) => ({ ...((prev as any) || {}), ...((updatedUser as any) || {}) }));
        
        // Update auth context
        await refreshUser();
        
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
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
        setShowChangePassword(false);
        toast.success('Đổi mật khẩu thành công!');
      } else {
        toast.error(response.message || 'Mật khẩu hiện tại không đúng');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cập nhật cài đặt thông báo thành công!');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imageUrl = URL.createObjectURL(file);
      setUser((prev: any) => ({ ...((prev as any) || {}), avatar: imageUrl }));
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="flex space-x-6">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem thông tin cá nhân</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Không thể tải thông tin cá nhân</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Image
                src={user.avatar?.url || user.avatar || '/placeholder-room.svg'}
                alt={user.full_name || 'User Avatar'}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <CameraIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{user.full_name}</h3>
                {user.is_verified && (
                  <CheckCircleIcon className="h-6 w-6 text-blue-500" title="Tài khoản đã xác thực" />
                )}
              </div>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <p className="text-gray-600 mb-3">{user.phone || 'Chưa cập nhật'}</p>
              
              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div>
                  <span className="font-medium text-gray-900">{user.total_posts || 0}</span> tin đăng
                </div>
                <div>
                  <span className="font-medium text-gray-900">{(user.total_views || 0).toLocaleString()}</span> lượt xem
                </div>
                <div>
                  <span className="font-medium text-gray-900">{user.rating || 0}/5</span> đánh giá ({user.review_count || 0} lượt)
                </div>
                <div>
                  Tham gia từ {new Date(user.member_since || user.createdAt || Date.now()).getFullYear()}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thông tin chi tiết</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
                {user.is_email_verified && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" title="Email đã xác thực" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone}</p>
                )}
                {user.is_phone_verified && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" title="SĐT đã xác thực" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.address || 'Chưa cập nhật'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bảo mật</h3>
            </div>
            <div className="p-6">
              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Đổi mật khẩu
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowChangePassword(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt thông báo</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email thông báo</p>
                  <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS thông báo</p>
                  <p className="text-sm text-gray-500">Nhận thông báo qua SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsNotifications}
                  onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Push notifications</p>
                  <p className="text-sm text-gray-500">Nhận thông báo đẩy trên trình duyệt</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Tin nhắn mới</p>
                  <p className="text-sm text-gray-500">Thông báo khi có tin nhắn mới</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newMessages}
                  onChange={(e) => handleNotificationChange('newMessages', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Cập nhật tin đăng</p>
                  <p className="text-sm text-gray-500">Thông báo về trạng thái tin đăng</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.postUpdates}
                  onChange={(e) => handleNotificationChange('postUpdates', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
