'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, UserIcon, PlusIcon, HomeIcon, MapPinIcon, AdjustmentsHorizontalIcon, HeartIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toastManager } from '@/components/ui/ToastManager';
import { useRoleCheck } from '@/components/auth/RoleGuard';

const categoryNavigation = [
  { name: 'Phòng trọ', href: '/phong-tro', color: 'text-orange-600' },
  { name: 'Nhà nguyên căn', href: '/nha-nguyen-can', color: 'text-gray-700' },
  { name: 'Căn hộ chung cư', href: '/can-ho', color: 'text-gray-700' },
  { name: 'Căn hộ mini', href: '/can-ho-mini', color: 'text-gray-700' },
  { name: 'Căn hộ dịch vụ', href: '/can-ho-dich-vu', color: 'text-gray-700' },
  { name: 'Ở ghép', href: '/o-ghep', color: 'text-gray-700' },
  { name: 'Mặt bằng', href: '/mat-bang', color: 'text-gray-700' },
  { name: 'Blog', href: '/blog', color: 'text-gray-700' },
  { name: 'Bảng giá dịch vụ', href: '/bang-gia', color: 'text-gray-700' },
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
    try {
      await logout();
      toastManager.showSuccess('Đã đăng xuất thành công');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toastManager.showError('Có lỗi khi đăng xuất');
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  <span className="text-blue-600">PHONGTRO</span>
                  <span className="text-orange-500">VN</span>
                  <span className="text-gray-600">.COM</span>
                </div>
              </Link>
              <div className="ml-4 text-xs text-gray-500 hidden md:block">
                Kênh thông tin phòng trọ số 1 Việt Nam
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Location Button */}
              <button className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                <MapPinIcon className="h-4 w-4" />
                <span className="text-sm">Tìm theo khu vực</span>
              </button>

              {/* Filter Button */}
              <button className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span className="text-sm">Bộ lọc</span>
              </button>

              {/* Saved Properties */}
              <Link
                href="/profile?tab=saved"
                className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <HeartIcon className="h-4 w-4" />
                <span className="text-sm">Tin đã lưu</span>
              </Link>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile?tab=notifications"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <BellIcon className="h-4 w-4" />
                    <span className="text-sm hidden md:inline">Thông báo</span>
                  </Link>
                  
                  <Link 
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="text-sm hidden md:inline">{user?.full_name || 'Tài khoản'}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/dang-nhap"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm">Đăng nhập</span>
                  </Link>
                </div>
              )}

              {/* Post Listing Button - Always visible */}
              <Link
                href="/dang-tin"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Đăng tin</span>
              </Link>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Categories */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 overflow-x-auto py-3">
            {categoryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap text-sm font-medium hover:text-orange-600 transition-colors ${item.color}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">PHONGTRO</span>
              <span className="text-orange-500">123</span>
              <span className="text-gray-600">.COM</span>
            </Link>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="px-4 py-6 space-y-4">
            {categoryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-base font-medium text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="pt-4 border-t space-y-4">
                <Link
                  href="/profile"
                  className="block text-base font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tài khoản
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block text-base font-medium text-red-600"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t space-y-4">
                <Link
                  href="/dang-ky"
                  className="block text-base font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
                <Link
                  href="/dang-nhap"
                  className="block text-base font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
