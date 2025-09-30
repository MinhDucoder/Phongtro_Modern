'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardGuard from '@/components/auth/DashboardGuard';
import { toastManager } from '@/components/ui/ToastManager';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  HeartIcon, 
  UserIcon, 
  CogIcon, 
  ChartBarIcon, 
  BellIcon, 
  Bars3Icon, 
  XMarkIcon, 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon, 
  CreditCardIcon,
  HandRaisedIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: HomeIcon },
  { name: 'Tin đăng của tôi', href: '/dashboard/tin-dang', icon: DocumentTextIcon },
  { name: 'Yêu cầu thuê', href: '/dashboard/yeu-cau-thue', icon: HandRaisedIcon },
  { name: 'Phân tích tin đăng', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Lịch hẹn xem phòng', href: '/lich-hen', icon: CalendarDaysIcon },
  { name: 'Tin đã lưu', href: '/dashboard/yeu-thich', icon: HeartIcon },
  { name: 'Tin nhắn', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Thông báo', href: '/thong-bao', icon: BellIcon },
  { name: 'Lịch sử thanh toán', href: '/dashboard/thanh-toan', icon: CreditCardIcon },
  { name: 'Hồ sơ của tôi', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Cài đặt tài khoản', href: '/dashboard/settings', icon: CogIcon },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user: authUser } = useAuth();

  const handleLogout = async () => {
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

  // Mock user data - trong thực tế sẽ fetch từ API
  const user = {
    name: authUser?.full_name || 'Nguyễn Văn A',
    email: authUser?.email || 'nguyenvana@email.com',
    avatar: '/placeholder-room.svg',
    isVerified: true,
    memberSince: '2023',
  };

  return (
    <DashboardGuard>
      <div className="h-screen bg-gray-50 flex" suppressHydrationWarning>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white" suppressHydrationWarning>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  NhaTroVN
                </Link>
              </div>
              <nav className="mt-5 space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* Logout button for mobile */}
                <div className="border-t border-gray-200 mt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="flex items-center w-full px-2 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6" />
                    Đăng xuất
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!sidebarHidden && (
        <div className={`hidden lg:flex lg:flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`} suppressHydrationWarning>
        <div className="flex h-full flex-col bg-white shadow">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center justify-between px-4">
              {!sidebarCollapsed && (
                <Link href="/" className="text-xl font-bold text-blue-600">
                  NhaTroVN
                </Link>
              )}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1 rounded-md hover:bg-gray-100"
                  title={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
                >
                  <Bars3Icon className="h-5 w-5 text-gray-600" />
                </button>
                
              </div>
            </div>
            
            {/* User info */}
            {!sidebarCollapsed && (
              <div className="mt-6 px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name || 'User Avatar'}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {sidebarCollapsed && (
              <div className="mt-6 px-2">
                <div className="flex justify-center">
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.name || 'User Avatar'}
                    width={32}
                    height={32}
                  />
                </div>
              </div>
            )}

            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    {!sidebarCollapsed && item.name}
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 mt-2">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Đăng xuất
            </button>
          </div>
            </nav>

          </div>
        </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300`} suppressHydrationWarning>
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/" className="text-lg font-bold text-blue-600">
              NhaTroVN
            </Link>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-900">
                <BellIcon className="h-6 w-6" />
              </button>
              <Image
                className="h-8 w-8 rounded-full"
                src={user.avatar}
                alt={user.name || 'User Avatar'}
                width={32}
                height={32}
              />
            </div>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {sidebarHidden && (
                  <button
                    onClick={() => setSidebarHidden(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                    title="Hiện menu"
                  >
                    <Bars3Icon className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <h1 className="text-2xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-900">
                  <BellIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.name || 'User Avatar'}
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </DashboardGuard>
  );
}
