'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, UserIcon, PlusIcon, HomeIcon, BuildingOfficeIcon, ChatBubbleLeftRightIcon, ChartBarIcon, CogIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toastManager } from '@/components/ui/ToastManager';
import { useRoleCheck } from '@/components/auth/RoleGuard';
import NotificationBell from './NotificationBell';
import ChatDropdown from './ChatDropdown';

const mainNavigation = [
  { name: 'Phòng trọ', href: '/phong-tro' },
  { name: 'Nhà nguyên căn', href: '/nha-nguyen-can' },
  { name: 'Căn hộ', href: '/can-ho' },
  { name: 'Tìm kiếm', href: '/tim-kiem' },
];

const secondaryNavigation = [
  { name: 'Tin đã lưu', href: '/profile?tab=saved' },
  { name: 'Thông báo', href: '/profile?tab=notifications' },
  { name: 'Tin nhắn', href: '/chat' },
  { name: 'Cài đặt', href: '/profile?tab=settings' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isLandlord, isAdmin } = useRoleCheck();
  const router = useRouter();

  const getAvatarUrl = (avatar: any): string | undefined => {
    if (!avatar) return undefined;
    if (typeof avatar === 'string') return avatar.trim() || undefined;
    if (typeof avatar === 'object') {
      return (
        avatar.url ||
        avatar.secure_url ||
        avatar.path ||
        avatar.src ||
        avatar.href ||
        undefined
      );
    }
    return undefined;
  };


  const handleLogout = async () => {
    console.log('Logout button clicked!');
    try {
      await logout();
      toastManager.showSuccess('Đã đăng xuất thành công', {
        description: 'Hẹn gặp lại bạn!',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toastManager.showError('Có lỗi khi đăng xuất');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NhaTroVN</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-1">
            {/* Landlord Dashboard - Icon only */}
            {isLandlord() && (
              <Link
                href="/dashboard"
                className="hidden md:flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Dashboard"
              >
                <ChartBarIcon className="h-5 w-5" />
              </Link>
            )}

            {/* Admin Panel - Icon only */}
            {isAdmin() && (
              <Link
                href="/admin"
                className="hidden md:flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Admin Panel"
              >
                <CogIcon className="h-5 w-5" />
              </Link>
            )}

            {/* Saved Properties - Icon only */}
            <Link
              href="/profile?tab=saved"
              className="hidden md:flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Tin đã lưu"
            >
              <HeartIcon className="h-5 w-5" />
            </Link>

            {/* Chat Dropdown */}
            <div className="hidden md:block">
              <ChatDropdown />
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Post Listing Button - Only for Landlords */}
            {isLandlord() && (
              <Link
                href="/dang-tin"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm ml-2"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Đăng tin
              </Link>
            )}

            {/* User Info / Login */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center ml-2">
                <Link 
                  href="/profile"
                  className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {getAvatarUrl(user?.avatar) && getAvatarUrl(user?.avatar) !== '/placeholder-room.svg' ? (
                    <img
                      src={getAvatarUrl(user?.avatar) || '/placeholder-room.svg'}
                      alt={user?.full_name || 'Avatar'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.full_name ? user.full_name[0].toUpperCase() : 'N'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.full_name || user?.email}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors ml-2"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50 bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                    <HomeIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">NhaTroVN</span>
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-4 py-6 space-y-1">
                {/* Main Navigation */}
                <div className="space-y-1">
                  {mainNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Role-based navigation */}
                  {isLandlord() && landlordNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                      {item.name}
                    </Link>
                  ))}
                  
                  {isAdmin() && adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Secondary Navigation */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-1">
                    {secondaryNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Role-based Navigation in Mobile */}
                {isLandlord() && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-1">
                      {landlordNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {isAdmin() && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-1">
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-1">
                  <Link
                    href="/chat"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
                    Tin nhắn
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      {/* User Info in Mobile */}
                      <div className="px-3 py-2 border-b border-gray-200">
                        <Link 
                          href={user?.role === 'landlord' ? '/dashboard' : user?.role === 'admin' ? '/admin' : '/profile'}
                          className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user?.full_name ? user.full_name[0].toUpperCase() : 'N'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user?.full_name || user?.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user?.role === 'admin' ? 'Quản trị viên' : 
                               user?.role === 'landlord' ? 'Chủ nhà' : 'Người dùng'}
                            </div>
                          </div>
                        </Link>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 mr-3" />
                        Hồ sơ
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/dang-nhap"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>

                {/* Post Listing Button - Only for Landlords */}
                {isLandlord() && (
                  <div className="pt-4">
                    <Link
                      href="/dang-tin"
                      className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-blue-600 text-base font-medium text-white hover:bg-blue-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Đăng tin
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
