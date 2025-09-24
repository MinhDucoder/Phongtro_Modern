"use client";

import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* 404 Text */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Trang không tìm thấy
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Về trang chủ
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Quay lại
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Có thể bạn đang tìm kiếm:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Link
                href="/phong-tro"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                → Tìm phòng trọ
              </Link>
              <Link
                href="/dang-tin"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                → Đăng tin cho thuê
              </Link>
              <Link
                href="/bang-gia"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                → Bảng giá dịch vụ
              </Link>
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                → Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
