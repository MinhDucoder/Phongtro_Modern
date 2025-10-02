'use client';

import StatsOverview from '@/components/stats/StatsOverview';
import RealTimeCounter from '@/components/stats/RealTimeCounter';
import TrendingChart from '@/components/stats/TrendingChart';
import { AdminOnly } from '@/components/auth/ProtectedRoute';

export default function AnalyticsPage() {
  return (
    <AdminOnly>
      <AnalyticsContent />
    </AdminOnly>
  );
}

function AnalyticsContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Thống kê và phân tích dữ liệu hệ thống
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview & Real-time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Overview */}
          <div className="lg:col-span-2">
            <StatsOverview />
          </div>
          
          {/* Real-time Counter */}
          <div>
            <RealTimeCounter />
          </div>
        </div>
        
        {/* Trending Chart */}
        <div className="mb-8">
          <TrendingChart />
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* City Analytics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thống kê theo thành phố
            </h3>
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2">Sẽ có thêm biểu đồ thành phố</p>
              </div>
            </div>
          </div>

          {/* Price Analytics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phân tích giá thuê
            </h3>
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <p className="mt-2">Sẽ có thêm phân tích giá</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
