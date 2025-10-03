'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  { name: 'Thông tin cá nhân', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Cài đặt', href: '/dashboard/settings', icon: CogIcon },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayoutFixed({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user: authUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Mock user data - trong thực tế sẽ fetch từ API
  const user = {
    name: authUser?.full_name || 'Chủ nhà Test',
    email: authUser?.email || 'landlord@test.com',
    avatar: '/placeholder-room.svg',
    isVerified: true,
    memberSince: '2023',
  };

  return (
    <div className="h-screen bg-gray-50 flex" suppressHydrationWarning>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4 py-4">
              <Image
                className="h-8 w-auto"
                src="/placeholder-room.svg"
                alt="Logo"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-bold text-gray-900">NhaTroVN</span>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
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
                    >
                      <item.icon className={`mr-4 h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Image
                  className="h-8 w-auto"
                  src="/placeholder-room.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                />
                {!sidebarCollapsed && (
                  <span className="ml-2 text-xl font-bold text-gray-900">NhaTroVN</span>
                )}
              </div>
              
              {sidebarCollapsed && (
                <div className="mt-6 px-2">
                  <div className="flex justify-center">
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={typeof user.avatar === 'string' && user.avatar.trim() !== '' ? user.avatar : '/placeholder-room.svg'}
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
                    {!sidebarCollapsed && 'Đăng xuất'}
                  </button>
                </div>
              </nav>

            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <span className="text-xl font-semibold text-gray-900">Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <div className="ml-3">
                  <div className="flex items-center space-x-4">
                    {!sidebarCollapsed && (
                      <div className="text-sm">
                        <p className="text-gray-700 font-medium">{user.name}</p>
                        <p className="text-gray-500">{user.email}</p>
                      </div>
                    )}
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={typeof user.avatar === 'string' && user.avatar.trim() !== '' ? user.avatar : '/placeholder-room.svg'}
                      alt={user.name || 'User Avatar'}
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
