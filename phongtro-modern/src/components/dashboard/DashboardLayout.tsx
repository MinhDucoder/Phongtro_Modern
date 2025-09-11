'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  PlusIcon, 
  ArrowRightOnRectangleIcon, 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon, 
  CreditCardIcon,
  HandRaisedIcon
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Mock user data - trong thực tế sẽ fetch từ API
  const user = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    avatar: '/placeholder-room.svg',
    isVerified: true,
    memberSince: '2023',
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                    >
                      <item.icon className="mr-4 h-6 w-6" />
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                NhaTroVN
              </Link>
            </div>
            
            {/* User info */}
            <div className="mt-6 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image
                    className="h-10 w-10 rounded-full"
                    src={user.avatar}
                    alt={user.name}
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
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Quick actions */}
            <div className="px-2 pb-4">
              <Link
                href="/dang-tin"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Đăng tin mới
              </Link>
              
              <button className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
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
                alt={user.name}
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-900">
                  <BellIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.name}
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
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
