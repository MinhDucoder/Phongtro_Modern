'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircleIcon, 
  HomeIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Mock data - trong thực tế sẽ fetch từ API
const mockOrder = {
  id: 'ORD-001',
  requestId: 'REQ-001',
  status: 'pending_payment', // pending_payment, paid, completed
  createdAt: new Date(),
  property: {
    id: '1',
    title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
    price: 3800000,
    area: '25 m²',
    location: 'Hai Bà Trưng, Hà Nội',
    address: 'Ngõ 3 Trần Khát Chân, Hai Bà Trưng, Hà Nội',
    image: '/placeholder-room.svg',
    landlord: {
      name: 'Lê Nhật Duy',
      phone: '0365349437',
      avatar: '/placeholder-room.svg',
    }
  },
  seeker: {
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    email: 'nguyenvana@email.com',
    idCard: '123456789',
    address: '123 Đường ABC, Quận XYZ, TP.HCM'
  },
  rentalTerms: {
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    duration: '6 tháng',
    monthlyRent: 3800000,
    deposit: 3800000, // 1 tháng tiền cọc
    totalAmount: 7600000, // tiền cọc + tháng đầu
    utilities: {
      electricity: 4000, // per kWh
      water: 25000, // per person per month
      internet: 0, // free
      parking: 50000 // per month
    }
  },
  payment: {
    method: 'vnpay',
    status: 'pending',
    transactionId: null,
    paidAt: null
  }
};

export default function OrderSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const [order, setOrder] = useState(mockOrder);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleProceedToPayment = () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      router.push(`/thanh-toan-thue-phong?orderId=${order.id}`);
    }, 1000);
  };

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Đã hủy đơn hàng');
      router.push('/dashboard');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Tóm tắt đơn hàng</h1>
          <p className="text-gray-600 mt-2">Mã đơn hàng: {order.id}</p>
        </div>

        {/* Status Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-blue-900">
                Yêu cầu thuê đã được chấp nhận!
              </h2>
              <p className="text-blue-700 mt-1">
                Chủ nhà đã chấp nhận yêu cầu thuê của bạn. Vui lòng thanh toán để hoàn tất giao dịch.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Thông tin phòng
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Image
                  src={order.property.image}
                  alt={order.property.title}
                  width={80}
                  height={80}
                  className="rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">
                    {order.property.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.property.location}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {formatPrice(order.property.price)}/tháng
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diện tích:</span>
                    <span className="font-medium">{order.property.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Địa chỉ:</span>
                    <span className="font-medium text-right max-w-xs">{order.property.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Terms */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Điều khoản thuê
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Ngày bắt đầu:</span>
                  <p className="font-medium">{formatDate(order.rentalTerms.startDate)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Ngày kết thúc:</span>
                  <p className="font-medium">{formatDate(order.rentalTerms.endDate)}</p>
                </div>
              </div>
              
              <div>
                <span className="text-gray-500">Thời gian thuê:</span>
                <p className="font-medium">{order.rentalTerms.duration}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Chi phí tiện ích:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điện:</span>
                    <span className="font-medium">{formatPrice(order.rentalTerms.utilities.electricity)}/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nước:</span>
                    <span className="font-medium">{formatPrice(order.rentalTerms.utilities.water)}/người/tháng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Internet:</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giữ xe:</span>
                    <span className="font-medium">{formatPrice(order.rentalTerms.utilities.parking)}/tháng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2" />
            Tóm tắt thanh toán
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Tiền thuê tháng đầu:</span>
              <span className="font-medium">{formatPrice(order.rentalTerms.monthlyRent)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Tiền cọc (1 tháng):</span>
              <span className="font-medium">{formatPrice(order.rentalTerms.deposit)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Phí dịch vụ:</span>
              <span className="font-medium">Miễn phí</span>
            </div>
            
            <div className="flex justify-between items-center py-4">
              <span className="text-xl font-semibold text-gray-900">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(order.rentalTerms.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Lưu ý quan trọng</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Tiền cọc sẽ được hoàn lại khi kết thúc hợp đồng (trừ phí sửa chữa nếu có)</li>
                <li>• Bạn có thể hủy đơn hàng trước khi thanh toán</li>
                <li>• Sau khi thanh toán, bạn sẽ nhận được thông tin liên hệ chủ nhà</li>
                <li>• Vui lòng liên hệ chủ nhà để sắp xếp thời gian nhận phòng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800 mb-2">Bảo mật thanh toán</h4>
              <p className="text-sm text-green-700">
                Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối. 
                Chúng tôi không lưu trữ thông tin thẻ của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCardIcon className="w-5 h-5 mr-3" />
                Thanh toán ngay
              </>
            )}
          </button>
          
          <button
            onClick={handleCancelOrder}
            className="px-6 py-4 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Hủy đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Tóm tắt đơn hàng | Phongtro123.com',
  description: 'Xem lại thông tin đơn hàng thuê phòng trước khi thanh toán.',
};
