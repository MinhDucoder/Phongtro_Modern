'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function SubscriptionPaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const payment = searchParams.get('payment'); // success, failed, error
  const packageName = searchParams.get('package'); // Silver, Gold, Platinum
  const action = searchParams.get('action'); // new, extended
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
  
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto redirect sau 10 giây nếu thanh toán thành công
  useEffect(() => {
    if (payment === 'success' && mounted) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [payment, mounted]);

  // Redirect khi countdown = 0
  useEffect(() => {
    if (countdown === 0 && payment === 'success') {
      router.push('/dashboard/tin-dang');
    }
  }, [countdown, payment, router]);

  const getPackageInfo = (packageName: string | null) => {
    switch (packageName?.toLowerCase()) {
      case 'silver':
      case 'bạc':
        return {
          name: 'Gói Bạc',
          color: 'gray',
          duration: '30 ngày',
          posts: '10 tin',
          icon: '🥈'
        };
      case 'gold':
      case 'vàng':
        return {
          name: 'Gói Vàng',
          color: 'yellow',
          duration: '90 ngày',
          posts: '30 tin',
          icon: '🥇'
        };
      case 'platinum':
      case 'bạch kim':
        return {
          name: 'Gói Bạch Kim',
          color: 'purple',
          duration: '180 ngày',
          posts: '100 tin',
          icon: '💎'
        };
      default:
        return {
          name: packageName || 'Gói đăng ký',
          color: 'blue',
          duration: '',
          posts: '',
          icon: '📦'
        };
    }
  };

  const getVNPayMessage = (code: string | null) => {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá giới hạn giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };
    return messages[code || ''] || 'Không xác định được lỗi';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const packageInfo = getPackageInfo(packageName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Success Case */}
        {payment === 'success' && (
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {action === 'extended' ? 'Gia hạn thành công!' : 'Thanh toán thành công!'}
              </h1>
              <p className="text-lg text-gray-600">
                {action === 'extended' 
                  ? `Bạn đã gia hạn thêm ${packageInfo.name} thành công`
                  : `Bạn đã đăng ký ${packageInfo.name} thành công`
                }
              </p>
            </div>

            {/* Package Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{packageInfo.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900">{packageInfo.name}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="text-gray-700">
                      {action === 'extended' ? 'Thời gian gia hạn thêm' : 'Thời hạn sử dụng'}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">{packageInfo.duration}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600 mr-3" />
                    <span className="text-gray-700">
                      {action === 'extended' ? 'Số tin đăng tăng thêm' : 'Số tin được đăng'}
                    </span>
                  </div>
                  <span className="font-bold text-purple-600">{packageInfo.posts}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <SparklesIcon className="w-6 h-6 text-green-600 mr-3" />
                    <span className="text-gray-700">Ưu tiên hiển thị</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {packageInfo.name === 'Gói Bạch Kim' ? 'Cao nhất' : 
                     packageInfo.name === 'Gói Vàng' ? 'Cao' : 'Trung bình'}
                  </span>
                </div>

                {vnpTransactionNo && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Mã giao dịch: <span className="font-mono font-medium text-gray-900">{vnpTransactionNo}</span></p>
                      <p>Trạng thái: <span className="font-medium text-green-600">{getVNPayMessage(vnpResponseCode)}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">✨ Bạn có thể làm gì ngay bây giờ?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Đăng tin cho thuê phòng trọ, mặt bằng, căn hộ</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Tin của bạn sẽ được ưu tiên hiển thị trên trang chủ</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Tiếp cận hàng nghìn người tìm phòng mỗi ngày</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Quản lý tin đăng dễ dàng trong Dashboard</span>
                </li>
              </ul>
            </div>

            {/* Auto redirect notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                Tự động chuyển đến trang quản lý tin đăng sau <span className="font-bold text-blue-600">{countdown}</span> giây...
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/tin-dang"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors text-center flex items-center justify-center shadow-lg"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Quản lý tin đăng
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                href="/dang-tin"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors text-center flex items-center justify-center shadow-lg"
              >
                Đăng tin ngay
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* Failed Case */}
        {payment === 'failed' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircleIcon className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thanh toán không thành công
              </h1>
              <p className="text-lg text-gray-600">
                Rất tiếc, giao dịch của bạn không thể hoàn tất
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Lý do thất bại:</h3>
                  <p className="text-red-700">{getVNPayMessage(vnpResponseCode)}</p>
                  {vnpResponseCode && (
                    <p className="text-sm text-red-600 mt-2">Mã lỗi: {vnpResponseCode}</p>
                  )}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">💡 Một số nguyên nhân phổ biến:</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Tài khoản không đủ số dư</li>
                    <li>• Nhập sai mật khẩu OTP</li>
                    <li>• Thẻ chưa đăng ký Internet Banking</li>
                    <li>• Hủy giao dịch trong quá trình thanh toán</li>
                    <li>• Vượt quá giới hạn giao dịch trong ngày</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/thanh-toan"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors text-center shadow-lg"
              >
                Thử lại thanh toán
              </Link>
              
              <Link
                href="/dashboard"
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-center"
              >
                Về Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Error Case */}
        {payment === 'error' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Có lỗi xảy ra
              </h1>
              <p className="text-lg text-gray-600">
                Đã xảy ra lỗi trong quá trình xử lý thanh toán
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-yellow-200">
              <p className="text-gray-700 mb-4">
                Chúng tôi không thể hoàn tất giao dịch của bạn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📞 Hỗ trợ khách hàng</h3>
                <p className="text-sm text-blue-800">Hotline: <a href="tel:1900xxxx" className="font-bold">1900-xxxx</a></p>
                <p className="text-sm text-blue-800">Email: <a href="mailto:support@phongtro123.com" className="font-bold">support@phongtro123.com</a></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/thanh-toan"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors text-center shadow-lg"
              >
                Thử lại
              </Link>
              
              <Link
                href="/dashboard"
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-center"
              >
                Về Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="mt-8 bg-white/50 backdrop-blur rounded-lg p-6 text-center border">
          <h3 className="font-medium text-gray-900 mb-2">🤝 Cần hỗ trợ?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
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
