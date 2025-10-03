'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  ArrowRightIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

interface PaymentResultData {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  amount?: number;
  packageName?: string;
  packageDuration?: number;
  packagePostLimit?: number;
  paymentMethod?: string;
  paidAt?: Date;
  message?: string;
}

export default function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [resultData, setResultData] = useState<PaymentResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Lấy thông tin từ URL params
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
    const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_PayDate = searchParams.get('vnp_PayDate');

    // Xử lý kết quả thanh toán
    const isSuccess = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';
    
    setResultData({
      success: isSuccess,
      transactionId: vnp_TransactionNo || undefined,
      amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : undefined, // VNPay trả về amount * 100
      paymentMethod: 'VNPay',
      paidAt: vnp_PayDate ? parseVNPayDate(vnp_PayDate) : new Date(),
      message: isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'
    });
    
    setIsLoading(false);

    // Show toast
    if (isSuccess) {
      toastManager.showSuccess('Thanh toán thành công! Gói đăng tin đã được kích hoạt.');
    } else {
      toastManager.showError('Thanh toán thất bại. Vui lòng thử lại.');
    }
  }, [searchParams]);

  const parseVNPayDate = (vnpPayDate: string): Date => {
    // VNPay format: yyyyMMddHHmmss
    const year = vnpPayDate.substring(0, 4);
    const month = vnpPayDate.substring(4, 6);
    const day = vnpPayDate.substring(6, 8);
    const hour = vnpPayDate.substring(8, 10);
    const minute = vnpPayDate.substring(10, 12);
    const second = vnpPayDate.substring(12, 14);
    
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN');
  };

  const getPackageIcon = (packageName?: string) => {
    if (!packageName) return StarIcon;
    if (packageName.toLowerCase().includes('premium')) return FireIcon;
    if (packageName.toLowerCase().includes('vip')) return BoltIcon;
    return StarIcon;
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin thanh toán</h2>
          <p className="text-gray-600 mb-6">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          <Link
            href="/thanh-toan"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Quay lại trang thanh toán
          </Link>
        </div>
      </div>
    );
  }

  const { success, transactionId, amount, paymentMethod, paidAt, message } = resultData;
  const PackageIcon = getPackageIcon(resultData.packageName);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kết quả thanh toán</h1>
          <p className="text-gray-600 mt-2">Gói đăng tin</p>
        </div>

        {/* Status Card */}
        <div className={`${
          success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        } border rounded-lg p-8 mb-8 text-center`}>
          {success ? (
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
          )}
          
          <h2 className={`text-2xl font-bold mb-2 ${
            success ? 'text-green-800' : 'text-red-800'
          }`}>
            {message}
          </h2>
          
          <p className={`text-lg ${
            success ? 'text-green-700' : 'text-red-700'
          }`}>
            {success 
              ? 'Gói đăng tin của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu đăng tin ngay bây giờ!'
              : 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.'
            }
          </p>
        </div>

        {success && (
          <>
            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Chi tiết thanh toán
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-green-600">
                      {amount ? formatPrice(amount) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">{paymentMethod}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-medium font-mono text-sm">
                      {transactionId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">
                      {paidAt ? formatDate(paidAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Benefits */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <PackageIcon className="w-5 h-5 mr-2" />
                Quyền lợi đã kích hoạt
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span>Đăng tin không giới hạn</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span>Tin đăng được ưu tiên hiển thị</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span>Hỗ trợ khách hàng ưu tiên</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span>Thống kê chi tiết</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span>Quản lý tin đăng nâng cao</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span>Không quảng cáo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Bước tiếp theo</h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                  <p>Truy cập Dashboard để quản lý gói đăng tin</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                  <p>Bắt đầu đăng tin phòng trọ mới</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                  <p>Theo dõi hiệu quả qua thống kê chi tiết</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {success ? (
            <>
              <Link
                href="/dang-tin"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Đăng tin ngay
              </Link>
              
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
              >
                Về Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/thanh-toan"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
              >
                Thử lại thanh toán
              </Link>
              
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-center"
              >
                Về Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Support */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="font-medium text-gray-900 mb-2">Cần hỗ trợ?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Nếu bạn có bất kỳ câu hỏi nào về gói đăng tin, vui lòng liên hệ với chúng tôi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="tel:1900xxxx"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              📞 Hotline: 1900-xxxx
            </Link>
            <Link
              href="mailto:support@phongtro123.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ✉️ Email: support@phongtro123.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}