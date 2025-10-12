'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import { subscriptionApi } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

interface PackagePlan {
  _id: string;
  type: string;
  name: string;
  price: number;
  duration: number;
  postLimit: number;
  priority: number;
  features: string[];
  description: string;
  color: string;
}

interface Subscription {
  _id: string;
  packageType: string;
  packageName: string;
  postLimit: number;
  usedPosts: number;
  endDate: string;
  priority: number;
  status: string;
}

interface PackageSelectorProps {
  onPackageSelect?: (packageType: string) => void;
  showCurrentPackage?: boolean;
}

export default function PackageSelector({ onPackageSelect, showCurrentPackage = true }: PackageSelectorProps) {
  const [packages, setPackages] = useState<PackagePlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPackages();
    if (showCurrentPackage) {
      loadCurrentSubscription();
    }
  }, [showCurrentPackage]);

  const loadPackages = async () => {
    try {
      const response = await subscriptionApi.getPackages();
      if (response.success && response.data) {
        setPackages((response.data as any).packages || []);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toastManager.showError('Không thể tải danh sách gói đăng tin');
      setPackages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await subscriptionApi.getCurrentSubscription();
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.subscription) {
          setCurrentSubscription(data.subscription);
          setSelectedPackage(data.subscription.packageType);
        }
      }
    } catch (error) {
      console.error('Error loading current subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageType: string) => {
    setSelectedPackage(packageType);
    onPackageSelect?.(packageType);
  };

  const handlePurchase = async (packageType: string) => {
    if (packageType === 'free') {
      toastManager.showError('Gói miễn phí không cần thanh toán');
      return;
    }

    if (currentSubscription?.packageType === packageType) {
      toastManager.showError('Bạn đã đăng ký gói này rồi');
      return;
    }

    setPurchasing(true);
    try {
      // Find the selected package object to get its _id
      const selectedPkg = packages.find((pkg) => pkg.type === packageType);
      if (!selectedPkg) {
        toastManager.showError('Không tìm thấy gói đăng tin');
        setPurchasing(false);
        return;
      }
      // You may want to allow the user to select payment method; here we use 'default' as a placeholder
      const response = await subscriptionApi.purchasePackage({
        packageId: selectedPkg._id,
        paymentMethod: 'default'
      });
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.paymentUrl) {
          // Chuyển hướng đến trang thanh toán
          window.location.href = data.paymentUrl;
        } else {
          toastManager.showError('Không thể tạo đơn hàng thanh toán');
        }
      } else {
        toastManager.showError('Không thể tạo đơn hàng thanh toán');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toastManager.showError(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPackageColor = (type: string) => {
    switch (type) {
      case 'free': return 'border-gray-300 bg-gray-50';
      case 'silver': return 'border-gray-400 bg-gray-100';
      case 'gold': return 'border-yellow-400 bg-yellow-50';
      case 'platinum': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPackageTextColor = (type: string) => {
    switch (type) {
      case 'free': return 'text-gray-700';
      case 'silver': return 'text-gray-800';
      case 'gold': return 'text-yellow-800';
      case 'platinum': return 'text-purple-800';
      default: return 'text-gray-700';
    }
  };

  if (loading && showCurrentPackage) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gói hiện tại */}
      {showCurrentPackage && currentSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Gói đăng tin hiện tại</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-medium">{currentSubscription.packageName}</p>
              <p className="text-sm text-blue-600">
                Đã sử dụng: {currentSubscription.usedPosts}/{currentSubscription.postLimit} tin đăng
              </p>
              <p className="text-sm text-blue-600">
                Hết hạn: {new Date(currentSubscription.endDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                currentSubscription.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentSubscription.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách gói */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {showCurrentPackage ? 'Nâng cấp gói đăng tin' : 'Chọn gói đăng tin'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages && packages.length > 0 ? (
            packages.map((pkg) => (
              <div
                key={pkg._id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  getPackageColor(pkg.type)
                } ${
                  selectedPackage === pkg.type
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : 'hover:border-blue-300'
                } ${
                  currentSubscription?.packageType === pkg.type
                    ? 'opacity-75'
                    : ''
                }`}
                onClick={() => handlePackageSelect(pkg.type)}
              >
              {/* Badge cho gói phổ biến */}
              {pkg.type === 'gold' && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <StarIcon className="h-3 w-3 mr-1" />
                    Phổ biến
                  </span>
                </div>
              )}

              {/* Checkmark cho gói hiện tại */}
              {currentSubscription?.packageType === pkg.type && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              )}

              <div className="text-center">
                <h4 className={`font-bold text-lg ${getPackageTextColor(pkg.type)}`}>
                  {pkg.name}
                </h4>
                <div className="mt-2">
                  {pkg.price === 0 ? (
                    <span className="text-2xl font-bold text-gray-600">Miễn phí</span>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">/{pkg.duration} ngày</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-700">
                    <strong>{pkg.postLimit}</strong> tin đăng
                  </div>
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {feature}
                    </div>
                  ))}
                </div>

                {/* Nút hành động */}
                <div className="mt-4">
                  {currentSubscription?.packageType === pkg.type ? (
                    <span className="text-sm text-green-600 font-medium">
                      Đang sử dụng
                    </span>
                  ) : pkg.price === 0 ? (
                    <span className="text-sm text-gray-500">
                      Gói mặc định
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pkg.type);
                      }}
                      disabled={purchasing}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {purchasing ? 'Đang xử lý...' : 'Mua ngay'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              Đang tải danh sách gói đăng tin...
            </div>
          )}
        </div>
      </div>

      {/* Thông tin bổ sung */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Lưu ý:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Gói đăng tin sẽ được kích hoạt ngay sau khi thanh toán thành công</li>
          <li>• Tin đăng của gói cao hơn sẽ hiển thị ưu tiên hơn</li>
          <li>• Bạn có thể nâng cấp gói bất cứ lúc nào</li>
          <li>• Gói mới sẽ thay thế gói cũ và reset lại số lượt đăng tin</li>
        </ul>
      </div>
    </div>
  );
}