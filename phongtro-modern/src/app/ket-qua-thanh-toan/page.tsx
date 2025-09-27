'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  CreditCardIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

// Mock data - trong thực tế sẽ fetch từ API
const mockOrder = {
  id: 'ORD-001',
  totalAmount: 7600000,
  paymentMethod: 'VNPay',
  transactionId: 'TXN123456789',
  paidAt: new Date(),
  property: {
    id: '1',
    title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
    location: 'Hai Bà Trưng, Hà Nội',
    image: '/placeholder-room.svg',
    landlord: {
      name: 'Lê Nhật Duy',
      phone: '0365349437',
      email: 'lenhatduy@email.com',
      avatar: '/placeholder-room.svg'
    }
  },
  rentalTerms: {
    startDate: '2024-02-01',
    duration: '6 tháng',
    monthlyRent: 3800000,
    deposit: 3800000
  }
};

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status'); // success, failed, error
  const [order, setOrder] = useState(mockOrder);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          title: 'Thanh toán thành công!',
          description: 'Đơn hàng của bạn đã được xử lý thành công. Bạn có thể liên hệ chủ nhà để sắp xếp nhận phòng.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'failed':
        return {
          icon: XCircleIcon,
          color: 'red',
          title: 'Thanh toán thất bại',
          description: 'Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'yellow',
          title: 'Có lỗi xảy ra',
          description: 'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng liên hệ hỗ trợ.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'gray',
          title: 'Trạng thái không xác định',
          description: 'Không thể xác định trạng thái thanh toán.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(status || 'error');
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kết quả thanh toán</h1>
          <p className="text-gray-600 mt-2">Mã đơn hàng: {order.id}</p>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-8 mb-8 text-center`}>
          <StatusIcon className={`w-16 h-16 ${statusInfo.iconColor} mx-auto mb-4`} />
          <h2 className={`text-2xl font-bold ${statusInfo.textColor} mb-2`}>
            {statusInfo.title}
          </h2>
          <p className={`${statusInfo.textColor} text-lg`}>
            {statusInfo.description}
          </p>
        </div>

        {status === 'success' && (
          <>
            {/* Success Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Thông tin thanh toán
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-green-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-medium font-mono text-sm">{order.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">{formatDate(order.paidAt)}</span>
                  </div>
                </div>
              </div>

              {/* Landlord Contact */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Thông tin chủ nhà
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <img 
                      src={order.property.landlord.avatar} 
                      alt={order.property.landlord.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{order.property.landlord.name}</h4>
                      <p className="text-sm text-gray-600">Chủ nhà</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href={`tel:${order.property.landlord.phone}`}
                      className="flex items-center text-green-600 hover:text-green-700"
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {order.property.landlord.phone}
                    </Link>
                    <p className="text-sm text-gray-600">{order.property.landlord.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="w-5 h-5 mr-2" />
                Thông tin phòng đã thuê
              </h3>
              
              <div className="flex items-start">
                <img 
                  src={order.property.image} 
                  alt={order.property.title}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">
                    {order.property.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{order.property.location}</p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Thời gian thuê: {order.rentalTerms.duration}</p>
                    <p>Ngày bắt đầu: {new Date(order.rentalTerms.startDate).toLocaleDateString('vi-VN')}</p>
                    <p>Tiền thuê: {formatPrice(order.rentalTerms.monthlyRent)}/tháng</p>
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
                  <p>Liên hệ chủ nhà qua số điện thoại để sắp xếp thời gian nhận phòng</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                  <p>Chuẩn bị giấy tờ tùy thân và tiền cọc (nếu cần)</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                  <p>Ký hợp đồng thuê nhà và nhận chìa khóa</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
                  <p>Sau khi nhận phòng, bạn có thể viết đánh giá về chủ nhà</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {status === 'success' && (
            <>
              <Link
                href="/dashboard"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
              >
                Về Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                href="/dashboard/yeu-thich"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-center"
              >
                Xem phòng đã lưu
              </Link>
            </>
          )}
          
          {(status === 'failed' || status === 'error') && (
            <>
              <Link
                href={`/thanh-toan-thue-phong?orderId=${order.id}`}
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
          
          <Link
            href="/phong-tro"
            className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-center"
          >
            Tìm phòng khác
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="font-medium text-gray-900 mb-2">Cần hỗ trợ?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi
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

export const metadata = {
  title: 'Kết quả thanh toán | NhaTroVN',
  description: 'Xem kết quả thanh toán đơn hàng thuê phòng trọ.',
};
