'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Cho thuê phòng trọ', href: '/phong-tro' },
  { name: 'Cho thuê nhà nguyên căn', href: '/nha-nguyen-can' },
  { name: 'Cho thuê căn hộ', href: '/can-ho' },
  { name: 'Tìm kiếm nâng cao', href: '/tim-kiem' },
  { name: 'Tìm người ở ghép', href: '/o-ghep' },
  { name: 'Cho thuê mặt bằng', href: '/mat-bang' },
  { name: 'Blog', href: '/blog' },
  { name: 'Bảng giá dịch vụ', href: '/bang-gia' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Phongtro123.com</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/chat"
              className="hidden sm:flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              💬 Tin nhắn
            </Link>
            <Link
              href="/dang-nhap"
              className="hidden sm:flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <UserIcon className="h-5 w-5 mr-1" />
              Đăng nhập
            </Link>
            <Link
              href="/dang-tin"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Đăng tin
            </Link>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50 bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Phongtro123.com
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-base font-medium text-gray-900 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <Link
                    href="/dang-nhap"
                    className="block text-base font-medium text-gray-900 hover:text-blue-600"
                  >
                    Đăng nhập
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
