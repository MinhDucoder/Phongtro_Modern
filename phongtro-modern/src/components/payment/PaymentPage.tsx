'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import { subscriptionApi } from '@/lib/api';

interface ServicePackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // days
  postLimit: number;
  priority: number;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  originalPrice?: number;
  discount?: number;
  uniqueKey?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fee: number;
  processingTime: string;
  enabled: boolean;
}

// Icon mapping cho package
const getPackageIcon = (priority: number) => {
  switch (priority) {
    case 1: return StarIcon;
    case 2: return FireIcon;
    case 3: return BoltIcon;
    default: return StarIcon;
  }
};

// Color mapping cho package
const getPackageColor = (priority: number) => {
  switch (priority) {
    case 1: return 'blue';
    case 2: return 'orange';  
    case 3: return 'purple';
    default: return 'blue';
  }
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: CreditCardIcon,
    description: 'Thanh toán qua thẻ ngân hàng',
    fee: 0,
    processingTime: 'Ngay lập tức',
    enabled: true
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: DevicePhoneMobileIcon,
    description: 'Ví điện tử MoMo (Sắp ra mắt)',
    fee: 0,
    processingTime: 'Ngay lập tức',
    enabled: false
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: QrCodeIcon,
    description: 'Thanh toán qua ZaloPay (Sắp ra mắt)',
    fee: 0,
    processingTime: 'Ngay lập tức',
    enabled: false
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản',
    icon: BanknotesIcon,
    description: 'Chuyển khoản ngân hàng (Sắp ra mắt)',
    fee: 0,
    processingTime: '1-2 giờ làm việc',
    enabled: false
  }
];

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    loadPackages();
    loadCurrentSubscription();
    
    // Kiểm tra payment status từ URL
    const paymentStatus = searchParams.get('payment');
    const action = searchParams.get('action');
    
    if (paymentStatus === 'failed') {
      toastManager.showError('Thanh toán thất bại. Vui lòng thử lại.');
      window.history.replaceState({}, '', '/thanh-toan');
    } else if (paymentStatus === 'success') {
      if (action === 'extended') {
        toastManager.showSuccess('🎉 Gia hạn gói thành công! Thời gian và lượt đăng đã được cộng thêm.');
      }
      window.history.replaceState({}, '', '/thanh-toan');
    }
  }, [searchParams]);

  const loadCurrentSubscription = async () => {
    try {
      const response = await subscriptionApi.getCurrentSubscription();
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.subscription) {
          setCurrentSubscription(data.subscription);
        }
      }
    } catch (error) {
      console.error('Error loading current subscription:', error);
    }
  };

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionApi.getPackages();
      
      if (response.success && response.data) {
        const packages = Array.isArray(response.data) ? response.data : [response.data];
        
        // Chỉ lấy các gói trả phí (loại bỏ gói miễn phí)
        const paidPackages = packages.filter((pkg: any) => 
          pkg.price > 0 && pkg.priority > 0
        );
        
        const packagesWithUI = paidPackages.map((pkg: any, index: number) => ({
          ...pkg,
          uniqueKey: pkg._id || `package-${index}`, // Fallback key
          icon: getPackageIcon(pkg.priority),
          color: getPackageColor(pkg.priority),
          popular: pkg.priority === 2, // Premium package (Gói Vàng)
          features: [
            `Đăng tin trong ${pkg.duration} ngày`,
            `Số lượt đăng: ${pkg.postLimit} bài`,
            ...(pkg.priority === 1 ? [
              'Hiển thị ở trang chủ',
              'Hỗ trợ cơ bản',
              'Tối đa 5 hình ảnh'
            ] : []),
            ...(pkg.priority === 2 ? [
              'Ưu tiên hiển thị',
              'Tin nổi bật với viền vàng',
              'Tối đa 15 hình ảnh',
              'Thống kê chi tiết',
              'Hỗ trợ ưu tiên'
            ] : []),
            ...(pkg.priority === 3 ? [
              'Hiển thị đầu tiên',
              'Tin VIP với viền đỏ',
              'Không giới hạn hình ảnh',
              'Thống kê nâng cao',
              'Hỗ trợ 24/7',
              'Tự động gia hạn',
              'Quảng cáo trên mạng xã hội'
            ] : [])
          ]
        }));
        
        setPackages(packagesWithUI);
        console.log('Loaded paid packages only:', packagesWithUI); // Debug log
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toastManager.showError('Không thể tải danh sách gói dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPackage || !selectedPaymentMethod) {
      toastManager.showError('Vui lòng chọn gói dịch vụ và phương thức thanh toán');
      return;
    }

    if (selectedPaymentMethod !== 'vnpay') {
      toastManager.showError('Hiện tại chỉ hỗ trợ thanh toán qua VNPay');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Selected package:', selectedPackage);
      console.log('Payment data:', {
        packageId: selectedPackage._id,
        paymentMethod: selectedPaymentMethod
      });
      
      const response = await subscriptionApi.purchasePackage({
        packageId: selectedPackage._id,
        paymentMethod: selectedPaymentMethod
      });
      
      if (response.success && response.data) {
        const paymentData = response.data as any;
        if (paymentData.paymentUrl) {
          // Redirect to VNPay
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error('Không nhận được URL thanh toán từ VNPay');
        }
      } else {
        throw new Error(response.message || 'Không thể tạo đơn thanh toán');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toastManager.showError(error.message || 'Có lỗi xảy ra trong quá trình thanh toán');
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

  if (!mounted || isLoading) {
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
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có gói dịch vụ nào được tìm thấy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => {
                const IconComponent = pkg.icon;
                const isSelected = selectedPackage?._id === pkg._id;
                const key = pkg._id || pkg.uniqueKey || `package-${index}`;
                
                return (
                  <div
                    key={key}
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
                        </div>
                        <p className="text-gray-600 mt-1">
                          Sử dụng trong {pkg.duration} ngày - {pkg.postLimit} lượt đăng
                        </p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {pkg.features.map((feature: string, index: number) => (
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
          )}
        </div>

        {/* Payment Methods */}
        {selectedPackage && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Chọn phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.filter(method => method.enabled).map((method) => {
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
