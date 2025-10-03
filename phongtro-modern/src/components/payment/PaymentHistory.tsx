'use client';

import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toastManager } from '@/components/ui/ToastManager';
import { paymentApi } from '@/lib/api';
import PaymentStats from './PaymentStats';
import PaymentDetailModal from './PaymentDetailModal';

interface PaymentRecord {
  id: string;
  packageName: string;
  packageType: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  transactionId: string;
  packageStartDate: Date | string;
  packageEndDate: Date | string;
  packageDuration: number;
  invoiceUrl?: string;
  notes?: string;
  createdAt: Date | string;
  completedAt?: Date | string;
  failedAt?: Date | string;
  failureReason?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Thành công
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-3 w-3 mr-1" />
          Đang xử lý
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Thất bại
        </span>
      );
    case 'refunded':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <BanknotesIcon className="h-3 w-3 mr-1" />
          Đã hoàn tiền
        </span>
      );
    default:
      return null;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'VNPay':
      return <CreditCardIcon className="h-5 w-5" />;
    case 'MoMo':
      return <DevicePhoneMobileIcon className="h-5 w-5" />;
    case 'ZaloPay':
      return <QrCodeIcon className="h-5 w-5" />;
    case 'Chuyển khoản':
      return <BanknotesIcon className="h-5 w-5" />;
    default:
      return <CreditCardIcon className="h-5 w-5" />;
  }
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    setMounted(true);
    fetchPayments();
  }, [filter, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentApi.getPaymentHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: filter === 'all' ? undefined : filter
      });

      if (response.success && response.data) {
        setPayments(response.data.payments);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        setError(response.message || 'Không thể tải lịch sử thanh toán');
        setPayments([]);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setPayments([]);
      toastManager.showError('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = async (payment: PaymentRecord) => {
    try {
      if (payment.invoiceUrl) {
        toastManager.showSuccess('Đang tải hóa đơn...');
        const response = await paymentApi.downloadInvoice(payment.id);
        if (response.success && response.data?.invoiceUrl) {
          window.open(response.data.invoiceUrl, '_blank');
        } else {
          window.open(payment.invoiceUrl, '_blank');
        }
      } else {
        toastManager.showError('Hóa đơn chưa có sẵn');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toastManager.showError('Không thể tải hóa đơn');
    }
  };

  const handleRetryPayment = (payment: PaymentRecord) => {
    if (payment.status === 'failed') {
      toastManager.showSuccess('Đang chuyển hướng đến trang thanh toán...');
      window.location.href = '/thanh-toan';
    }
  };

  const handleViewDetail = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (loading && payments.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && payments.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <BanknotesIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchPayments()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
            <p className="text-gray-600">Theo dõi các giao dịch và gói dịch vụ của bạn</p>
          </div>
          <Link
            href="/thanh-toan"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Nâng cấp gói mới
          </Link>
        </div>

        <PaymentStats />

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tất cả ({payments.length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'completed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Thành công ({payments.filter(p => p.status === 'completed').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'pending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Đang xử lý ({payments.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'failed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Thất bại ({payments.filter(p => p.status === 'failed').length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có giao dịch nào</h3>
                <p className="text-gray-500">Các giao dịch thanh toán sẽ hiển thị tại đây</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg mr-4">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{payment.packageName}</h3>
                          <p className="text-sm text-gray-600">
                            Mã giao dịch: {payment.transactionId}
                          </p>
                          <p className="text-xs text-gray-500">
                            Gói {payment.packageType} - {payment.packageDuration} ngày
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Ngày thanh toán:</span>
                          <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Hết hạn:</span>
                          <p className="font-medium text-gray-900">{formatDate(payment.packageEndDate)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Số tiền:</span>
                          <p className="font-bold text-lg text-gray-900">{formatPrice(payment.amount)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      {getStatusBadge(payment.status)}
                      
                      <div className="flex space-x-2">
                        {payment.invoiceUrl && (
                          <button
                            onClick={() => handleDownloadInvoice(payment)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Tải hóa đơn"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleViewDetail(payment)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {payment.status === 'failed' && (
                          <button
                            onClick={() => handleRetryPayment(payment)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Thử lại
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} giao dịch
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1 || loading}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      disabled={loading}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pagination.page === pageNum
                          ? 'text-white bg-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        payment={selectedPayment}
        onDownloadInvoice={handleDownloadInvoice}
      />
    </>
  );
}
