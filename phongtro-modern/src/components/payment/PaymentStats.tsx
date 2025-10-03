'use client';

import { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

interface PackageDistribution {
  _id: string;
  count: number;
  totalAmount: number;
}

interface MonthlySpending {
  _id: {
    year: number;
    month: number;
  };
  total: number;
  count: number;
}

interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalSpent: number;
  activePackage: {
    packageName: string;
    packageType: string;
    endDate: string;
    daysRemaining: number;
  } | null;
  monthlySpending: MonthlySpending[];
  packageDistribution: PackageDistribution[];
}

export default function PaymentStats() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getPaymentStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Không thể tải thống kê');
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Có lỗi xảy ra');
      toastManager.showError('Không thể tải thống kê thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
      'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
              <p className="text-blue-100 text-xs mt-1">{stats.completedPayments} giao dịch</p>
            </div>
            <BanknotesIcon className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Thành công</p>
              <p className="text-2xl font-bold">{stats.completedPayments}</p>
              <p className="text-green-100 text-xs mt-1">
                {stats.totalPayments > 0
                  ? `${Math.round((stats.completedPayments / stats.totalPayments) * 100)}% tổng số`
                  : '0%'}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Đang xử lý</p>
              <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              <p className="text-yellow-100 text-xs mt-1">Chờ xác nhận</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">Thất bại</p>
              <p className="text-2xl font-bold">{stats.failedPayments}</p>
              <p className="text-red-100 text-xs mt-1">
                {stats.totalPayments > 0
                  ? `${Math.round((stats.failedPayments / stats.totalPayments) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <XCircleIcon className="h-12 w-12 text-red-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Active Package & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Package */}
        {stats.activePackage && (
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm mb-1">Gói đang sử dụng</p>
                <p className="text-2xl font-bold">{stats.activePackage.packageName}</p>
              </div>
              <TrophyIcon className="h-10 w-10 text-purple-200" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-100">Loại gói:</span>
                <span className="font-semibold uppercase">{stats.activePackage.packageType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-100">Hết hạn:</span>
                <span className="font-semibold">{formatDate(stats.activePackage.endDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-100">Còn lại:</span>
                <span className="font-semibold">
                  {stats.activePackage.daysRemaining} ngày
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Spending Chart */}
        {stats.monthlySpending.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiêu 6 tháng gần đây</h3>
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.monthlySpending.slice(-6).map((item, index) => {
                const maxAmount = Math.max(...stats.monthlySpending.map(m => m.total));
                const percentage = (item.total / maxAmount) * 100;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {getMonthName(item._id.month)}/{item._id.year}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.count} giao dịch</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Package Distribution */}
        {stats.packageDistribution.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Phân bổ theo gói</h3>
              <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.packageDistribution.map((item, index) => {
                const percentage = stats.totalPayments > 0 
                  ? (item.count / stats.totalPayments) * 100 
                  : 0;
                
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600',
                ];
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{item._id}</p>
                        <p className="text-sm text-gray-500">
                          {item.count} giao dịch • {formatPrice(item.totalAmount)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
