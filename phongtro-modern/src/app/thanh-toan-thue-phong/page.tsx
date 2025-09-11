'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCardIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  BanknotesIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Mock data - trong thực tế sẽ fetch từ API
const mockOrder = {
  id: 'ORD-001',
  totalAmount: 7600000,
  property: {
    title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
    location: 'Hai Bà Trưng, Hà Nội'
  },
  rentalTerms: {
    monthlyRent: 3800000,
    deposit: 3800000,
    startDate: '2024-02-01',
    duration: '6 tháng'
  }
};

const paymentMethods = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: CreditCardIcon,
    description: 'Thanh toán qua thẻ ngân hàng',
    fee: 0,
    processingTime: 'Ngay lập tức'
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: DevicePhoneMobileIcon,
    description: 'Ví điện tử MoMo',
    fee: 0,
    processingTime: 'Ngay lập tức'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: QrCodeIcon,
    description: 'Thanh toán qua ZaloPay',
    fee: 0,
    processingTime: 'Ngay lập tức'
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản',
    icon: BanknotesIcon,
    description: 'Chuyển khoản ngân hàng',
    fee: 0,
    processingTime: '1-2 giờ làm việc'
  }
];

export default function RentalPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(mockOrder);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful payment
      const isSuccess = Math.random() > 0.2; // 80% success rate
      
      if (isSuccess) {
        toast.success('Thanh toán thành công!');
        router.push(`/ket-qua-thanh-toan?orderId=${order.id}&status=success`);
      } else {
        toast.error('Thanh toán thất bại. Vui lòng thử lại.');
        router.push(`/ket-qua-thanh-toan?orderId=${order.id}&status=failed`);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra trong quá trình thanh toán');
      router.push(`/ket-qua-thanh-toan?orderId=${order.id}&status=error`);
    } finally {
      setIsProcessing(false);
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
            href={`/tom-tat-don-hang?requestId=${order.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại tóm tắt đơn hàng
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán thuê phòng</h1>
          <p className="text-gray-600 mt-2">Mã đơn hàng: {order.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn phương thức thanh toán</h2>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedPaymentMethod === method.id;
                
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <IconComponent className="w-8 h-8 text-gray-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>Phí: {method.fee === 0 ? 'Miễn phí' : `${formatPrice(method.fee)}`}</span>
                          <span className="mx-2">•</span>
                          <span>{method.processingTime}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Thông tin phòng</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{order.property.title}</p>
                <p className="text-sm text-gray-500">{order.property.location}</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Chi tiết thanh toán</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền thuê tháng đầu:</span>
                    <span className="font-medium">{formatPrice(order.rentalTerms.monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền cọc (1 tháng):</span>
                    <span className="font-medium">{formatPrice(order.rentalTerms.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí dịch vụ:</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  {selectedPaymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí thanh toán:</span>
                      <span className="font-medium">
                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.fee === 0 
                          ? 'Miễn phí' 
                          : formatPrice(paymentMethods.find(m => m.id === selectedPaymentMethod)?.fee || 0)
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Terms */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Thông tin thuê</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Thời gian thuê: {order.rentalTerms.duration}</p>
                <p>Ngày bắt đầu: {formatDate(order.rentalTerms.startDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
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

        {/* Important Notes */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Lưu ý quan trọng</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Sau khi thanh toán thành công, bạn sẽ nhận được thông tin liên hệ chủ nhà</li>
                <li>• Vui lòng liên hệ chủ nhà để sắp xếp thời gian nhận phòng</li>
                <li>• Tiền cọc sẽ được hoàn lại khi kết thúc hợp đồng (trừ phí sửa chữa nếu có)</li>
                <li>• Nếu có vấn đề, vui lòng liên hệ hotline: 1900-xxxx</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        {selectedPaymentMethod && (
          <div className="mt-8 text-center">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-12 rounded-lg text-lg transition-colors flex items-center mx-auto"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Đang xử lý thanh toán...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-3" />
                  Thanh toán {formatPrice(order.totalAmount)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Thanh toán thuê phòng | NhaTroVN',
  description: 'Thanh toán an toàn cho đơn hàng thuê phòng trọ.',
};
