'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, UserIcon, PlusIcon, HomeIcon, BuildingOfficeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const mainNavigation = [
  { name: 'Phòng trọ', href: '/phong-tro', icon: HomeIcon },
  { name: 'Nhà nguyên căn', href: '/nha-nguyen-can', icon: BuildingOfficeIcon },
  { name: 'Căn hộ', href: '/can-ho', icon: BuildingOfficeIcon },
  { name: 'Tìm kiếm', href: '/tim-kiem', icon: null },
];

const secondaryNavigation = [
  { name: 'Ở ghép', href: '/o-ghep' },
  { name: 'Mặt bằng', href: '/mat-bang' },
  { name: 'Blog', href: '/blog' },
  { name: 'Bảng giá', href: '/bang-gia' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Chat */}
            <Link
              href="/chat"
              className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              Tin nhắn
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <UserIcon className="h-4 w-4 mr-1" />
              Hồ sơ
            </Link>

            {/* Login */}
            <Link
              href="/dang-nhap"
              className="hidden sm:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Đăng nhập
            </Link>

            {/* Post Listing Button */}
            <Link
              href="/dang-tin"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Đăng tin
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-3" />
                    Hồ sơ
                  </Link>
                  <Link
                    href="/dang-nhap"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                </div>

                {/* Post Listing Button */}
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
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
