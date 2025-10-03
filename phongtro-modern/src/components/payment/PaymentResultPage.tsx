'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { subscriptionApi } from '@/lib/api';

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [packageType, setPackageType] = useState<string>('');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const pkg = searchParams.get('package');
    const reason = searchParams.get('reason');

    setPaymentStatus(status || '');
    setPackageType(pkg || '');

    if (status === 'success') {
      // Load current subscription để hiển thị thông tin mới
      loadCurrentSubscription();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const loadCurrentSubscription = async () => {
    try {
      const response = await subscriptionApi.getCurrentSubscription();
      if (response.success && response.data) {
        const data = response.data as any;
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Thanh toán thành công!';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return 'Có lỗi xảy ra';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Gói đăng tin đã được kích hoạt. Bạn có thể bắt đầu đăng tin ngay bây giờ.';
      case 'failed':
        return 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.';
      default:
        return 'Không thể xác định trạng thái thanh toán.';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Đang xử lý...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon và tiêu đề */}
          <div className="text-center">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {getStatusTitle()}
            </h2>
            <p className="mt-2 text-gray-600">
              {getStatusMessage()}
            </p>
          </div>

          {/* Thông tin gói nếu thanh toán thành công */}
          {paymentStatus === 'success' && currentSubscription && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin gói đăng tin
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên gói:</span>
                  <span className="font-medium">{currentSubscription.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-medium">{formatPrice(currentSubscription.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tin đăng:</span>
                  <span className="font-medium">{currentSubscription.postLimit} tin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã sử dụng:</span>
                  <span className="font-medium">
                    {currentSubscription.usedPosts}/{currentSubscription.postLimit} tin
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hết hạn:</span>
                  <span className="font-medium">
                    {new Date(currentSubscription.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Các nút hành động */}
          <div className="mt-8 space-y-3">
            {paymentStatus === 'success' ? (
              <>
                <Link
                  href="/dashboard/tin-dang"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-blue-700 block"
                >
                  Đăng tin ngay
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-gray-700 block"
                >
                  Về Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/thanh-toan"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-blue-700 block"
                >
                  Thử lại
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-gray-700 block"
                >
                  Về Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Thông tin hỗ trợ */}
          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-gray-500">
              Có thắc mắc? 
              <a href="mailto:support@phongtro.com" className="text-blue-600 hover:text-blue-500 ml-1">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}