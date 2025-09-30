'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  StarIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // days
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  originalPrice?: number;
  discount?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fee: number;
  processingTime: string;
}

const servicePackages: ServicePackage[] = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    description: 'Phù hợp cho người mới bắt đầu',
    price: 50000,
    duration: 7,
    features: [
      'Đăng tin trong 7 ngày',
      'Hiển thị ở trang chủ',
      'Hỗ trợ cơ bản',
      'Tối đa 5 hình ảnh'
    ],
    icon: StarIcon,
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Gói Premium',
    description: 'Phổ biến nhất - Tăng khả năng tiếp cận',
    price: 150000,
    duration: 30,
    originalPrice: 200000,
    discount: 25,
    popular: true,
    features: [
      'Đăng tin trong 30 ngày',
      'Ưu tiên hiển thị',
      'Tin nổi bật với viền vàng',
      'Tối đa 15 hình ảnh',
      'Thống kê chi tiết',
      'Hỗ trợ ưu tiên'
    ],
    icon: FireIcon,
    color: 'orange'
  },
  {
    id: 'vip',
    name: 'Gói VIP',
    description: 'Tối ưu nhất cho chủ nhà chuyên nghiệp',
    price: 300000,
    duration: 60,
    originalPrice: 400000,
    discount: 25,
    features: [
      'Đăng tin trong 60 ngày',
      'Hiển thị đầu tiên',
      'Tin VIP với viền đỏ',
      'Không giới hạn hình ảnh',
      'Thống kê nâng cao',
      'Hỗ trợ 24/7',
      'Tự động gia hạn',
      'Quảng cáo trên mạng xã hội'
    ],
    icon: BoltIcon,
    color: 'purple'
  }
];

const paymentMethods: PaymentMethod[] = [
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

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePayment = async () => {
    if (!selectedPackage || !selectedPaymentMethod) {
      toastManager.showError('Vui lòng chọn gói dịch vụ và phương thức thanh toán');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toastManager.showSuccess('Thanh toán thành công! Tin đăng của bạn đã được kích hoạt.');
      router.push('/dashboard/tin-dang');
    } catch {
      toastManager.showError('Có lỗi xảy ra trong quá trình thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nâng cấp tin đăng của bạn
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chọn gói dịch vụ phù hợp để tin đăng của bạn được nhiều người quan tâm hơn
          </p>
        </div>

        {/* Service Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Chọn gói dịch vụ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicePackages.map((pkg) => {
              const IconComponent = pkg.icon;
              const isSelected = selectedPackage?.id === pkg.id;
              
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 ring-4 ring-blue-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${pkg.popular ? 'scale-105' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Phổ biến nhất
                      </span>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-full bg-${pkg.color}-100 mr-4`}>
                        <IconComponent className={`h-8 w-8 text-${pkg.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                        <p className="text-gray-600">{pkg.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(pkg.price)}
                        </span>
                        {pkg.originalPrice && (
                          <>
                            <span className="text-lg text-gray-500 line-through ml-2">
                              {formatPrice(pkg.originalPrice)}
                            </span>
                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded ml-2">
                              -{pkg.discount}%
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">
                        Sử dụng trong {pkg.duration} ngày
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Đã chọn' : 'Chọn gói này'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        {selectedPackage && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Chọn phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedPaymentMethod === method.id;
                
                return (
                  <div
                    key={method.id}
                    className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-100 rounded-lg mr-4">
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{method.processingTime}</span>
                          {method.fee === 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-green-600 font-medium">Miễn phí</span>
                            </>
                          )}
                        </div>
                      </div>
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
                );
              })}
            </div>
          </div>
        )}

        {/* Order Summary */}
        {selectedPackage && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPackage.name}</h3>
                  <p className="text-sm text-gray-600">Sử dụng trong {selectedPackage.duration} ngày</p>
                </div>
                <span className="font-bold text-gray-900">
                  {formatPrice(selectedPackage.price)}
                </span>
              </div>
              
              {selectedPaymentMethod && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Phương thức thanh toán</span>
                  <span className="font-medium text-gray-900">
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(selectedPackage.price)}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Bảo mật thanh toán</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối. 
                    Chúng tôi không lưu trữ thông tin thẻ của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        {selectedPackage && selectedPaymentMethod && (
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-12 rounded-lg text-lg transition-colors flex items-center mx-auto"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-3" />
                  Thanh toán ngay
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
