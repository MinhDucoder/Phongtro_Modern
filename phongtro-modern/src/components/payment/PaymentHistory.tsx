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
import toast from 'react-hot-toast';

interface PaymentRecord {
  id: string;
  packageName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
  expiresAt: Date;
  invoiceUrl?: string;
}

// Mock payment history data
const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    packageName: 'Gói Premium - 30 ngày',
    amount: 150000,
    status: 'completed',
    paymentMethod: 'VNPay',
    transactionId: 'VNPAY_20240120_123456',
    createdAt: new Date(2024, 0, 20, 14, 30),
    expiresAt: new Date(2024, 1, 19, 14, 30),
    invoiceUrl: '/invoices/invoice_1.pdf'
  },
  {
    id: '2',
    packageName: 'Gói Cơ Bản - 7 ngày',
    amount: 50000,
    status: 'completed',
    paymentMethod: 'MoMo',
    transactionId: 'MOMO_20240115_789012',
    createdAt: new Date(2024, 0, 15, 10, 15),
    expiresAt: new Date(2024, 0, 22, 10, 15)
  },
  {
    id: '3',
    packageName: 'Gói VIP - 60 ngày',
    amount: 300000,
    status: 'pending',
    paymentMethod: 'ZaloPay',
    transactionId: 'ZALOPAY_20240118_345678',
    createdAt: new Date(2024, 0, 18, 16, 45),
    expiresAt: new Date(2024, 2, 18, 16, 45)
  },
  {
    id: '4',
    packageName: 'Gói Premium - 30 ngày',
    amount: 150000,
    status: 'failed',
    paymentMethod: 'Chuyển khoản',
    transactionId: 'BANK_20240110_901234',
    createdAt: new Date(2024, 0, 10, 9, 20),
    expiresAt: new Date(2024, 1, 9, 9, 20)
  }
];

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
  const [payments] = useState<PaymentRecord[]>(mockPayments);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = (payment: PaymentRecord) => {
    if (payment.invoiceUrl) {
      toast.success('Đang tải hóa đơn...');
      // In a real app, this would download the actual invoice
    } else {
      toast.error('Hóa đơn chưa có sẵn');
    }
  };

  const handleRetryPayment = (payment: PaymentRecord) => {
    if (payment.status === 'failed') {
      toast.success('Đang chuyển hướng đến trang thanh toán...');
      // In a real app, this would redirect to payment page
    }
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

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          <p className="text-gray-600">Theo dõi các giao dịch và gói dịch vụ của bạn</p>
        </div>
        <Link
          href="/thanh-toan"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nâng cấp gói mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-green-600">Thành công</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600">Đang xử lý</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-red-600">
                {payments.filter(p => p.status === 'failed').length}
              </div>
              <div className="text-sm text-red-600">Thất bại</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="text-sm text-blue-600">Tổng chi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Payment List */}
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
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Ngày thanh toán:</span>
                      <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hết hạn:</span>
                      <p className="font-medium text-gray-900">{formatDate(payment.expiresAt)}</p>
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
    </div>
  );
}
