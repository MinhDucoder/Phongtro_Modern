'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import PostLimitExceededModal from '@/components/subscription/PostLimitExceededModal';
import { 
  PhotoIcon, 
  XMarkIcon, 
  MapPinIcon,
  HomeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

interface FormData {
  // Loại tin và gói dịch vụ
  propertyType: string;
  servicePackage: string;
  
  // Thông tin cơ bản
  title: string;
  description: string;
  
  // Địa chỉ
  province: string;
  district: string;
  ward: string;
  address: string;
  
  // Thông tin phòng
  area: string;
  price: string;
  deposit: string;
  electricCost: string;
  waterCost: string;
  internetCost: string;
  parkingCost: string;
  
  // Tiện nghi
  amenities: string[];
  
  // Hình ảnh
  images: File[];
  
  // Thông tin liên hệ
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
}

const propertyTypes = [
  { value: 'phong-tro', label: 'Phòng trọ' },
  { value: 'nha-nguyen-can', label: 'Nhà nguyên căn' },
  { value: 'can-ho', label: 'Căn hộ chung cư' },
  { value: 'can-ho-mini', label: 'Căn hộ mini' },
  { value: 'can-ho-dich-vu', label: 'Căn hộ dịch vụ' },
  { value: 'o-ghep', label: 'Ở ghép' },
  { value: 'mat-bang', label: 'Mặt bằng' },
];

const servicePackages = [
  { 
    value: 'free', 
    label: 'Tin thường', 
    price: 0, 
    duration: '7 ngày',
    features: ['Hiển thị cơ bản', 'Không ưu tiên']
  },
  { 
    value: 'vip1', 
    label: 'Tin VIP 1', 
    price: 50000, 
    duration: '30 ngày',
    features: ['Hiển thị nổi bật', 'Ưu tiên cao', 'Khung viền vàng']
  },
  { 
    value: 'vip2', 
    label: 'Tin VIP 2', 
    price: 100000, 
    duration: '30 ngày',
    features: ['Hiển thị rất nổi bật', 'Ưu tiên rất cao', 'Khung viền đỏ']
  },
  { 
    value: 'vip3', 
    label: 'Tin VIP 3', 
    price: 200000, 
    duration: '30 ngày',
    features: ['Hiển thị đặc biệt', 'Ưu tiên tối đa', 'Khung viền gradient']
  },
];

const provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
];

const amenitiesList = [
  'Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Máy giặt', 'Giường', 'Tủ quần áo',
  'Bàn học', 'WiFi miễn phí', 'TV', 'Bếp gas', 'Lò vi sóng', 'Bình nóng lạnh',
  'Camera an ninh', 'Thang máy', 'Bảo vệ 24/7', 'Chỗ để xe', 'Ban công',
  'Cửa sổ', 'WC riêng', 'Cho phép nấu ăn', 'Cho phép nuôi pet', 'Giờ giấc tự do'
];

export default function PostPropertyForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    propertyType: '',
    servicePackage: 'free',
    title: '',
    description: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    area: '',
    price: '',
    deposit: '',
    electricCost: '4000',
    waterCost: '25000',
    internetCost: '0',
    parkingCost: '50000',
    amenities: [],
    images: [],
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
  });

  // Load thông tin subscription khi component mount
  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      try {
        setLoadingSubscription(true);
        const response = await api.dashboard.getSubscriptionInfo();
        console.log('Subscription info:', response);
        
        if (response.data?.hasActiveSubscription && response.data?.subscription?.canCreatePost) {
          setUserSubscription(response.data.subscription);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    loadSubscriptionInfo();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 10;
    
    if (formData.images.length + files.length > maxFiles) {
      toastManager.showError(`Chỉ được upload tối đa ${maxFiles} ảnh`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toastManager.showError(`File ${file.name} không phải là ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toastManager.showError(`File ${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.propertyType) {
          toastManager.showError('Vui lòng chọn loại bất động sản');
          return false;
        }
        if (!formData.title.trim()) {
          toastManager.showError('Vui lòng nhập tiêu đề');
          return false;
        }
        if (!formData.description.trim()) {
          toastManager.showError('Vui lòng nhập mô tả');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.province || !formData.district || !formData.address.trim()) {
          toastManager.showError('Vui lòng điền đầy đủ thông tin địa chỉ');
          return false;
        }
        return true;
        
      case 3:
        if (!formData.area || !formData.price) {
          toastManager.showError('Vui lòng điền đầy đủ thông tin diện tích và giá');
          return false;
        }
        if (parseInt(formData.area) <= 0) {
          toastManager.showError('Diện tích phải lớn hơn 0');
          return false;
        }
        if (parseInt(formData.price) <= 0) {
          toastManager.showError('Giá thuê phải lớn hơn 0');
          return false;
        }
        return true;
        
      case 4:
        if (formData.images.length === 0) {
          toastManager.showError('Vui lòng upload ít nhất 1 ảnh');
          return false;
        }
        return true;
        
      case 5:
        if (!formData.contactName.trim() || !formData.contactPhone.trim()) {
          toastManager.showError('Vui lòng điền đầy đủ thông tin liên hệ');
          return false;
        }
        if (!/^[0-9]{10}$/.test(formData.contactPhone.replace(/\s/g, ''))) {
          toastManager.showError('Số điện thoại không hợp lệ');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    
    try {
      const selectedPackage = servicePackages.find(pkg => pkg.value === formData.servicePackage);
      
      // Nếu user có subscription active, sử dụng lượt đăng từ subscription
      if (userSubscription && userSubscription.canCreatePost) {
        // Tạo FormData để upload hình ảnh
        const formDataToSend = new FormData();
        
        // Thêm thông tin room
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('province', formData.province);
        formDataToSend.append('district', formData.district);
        formDataToSend.append('ward', formData.ward);
        formDataToSend.append('area', formData.area);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('deposit', formData.deposit);
        formDataToSend.append('electricCost', formData.electricCost);
        formDataToSend.append('waterCost', formData.waterCost);
        formDataToSend.append('internetCost', formData.internetCost);
        formDataToSend.append('parkingCost', formData.parkingCost);
        formDataToSend.append('type', formData.propertyType);
        
        // Thêm amenities
        formData.amenities.forEach(amenity => {
          formDataToSend.append('amenities[]', amenity);
        });
        
        // Thêm hình ảnh
        formData.images.forEach(image => {
          formDataToSend.append('images', image);
        });

        console.log('Creating room with subscription...');
        const roomResponse = await api.rooms.createRoom(formDataToSend);
        console.log('Room created:', roomResponse);

        // Tạo post với room vừa tạo
        const postData = {
          roomId: roomResponse.data._id,
          options: formData.amenities,
          favouriteLevel: 'free', // Subscription users get standard posts
        };

        console.log('Creating post with subscription:', postData);
        const postResponse = await api.dashboard.createPost(postData);
        console.log('Post created:', postResponse);
        
        toastManager.showSuccess(`Đăng tin thành công! Còn lại ${userSubscription.remainingPosts - 1}/${userSubscription.postLimit} lượt đăng.`);
        router.push('/dashboard/tin-dang');
        return;
      }
      
      // Nếu chọn gói VIP (có phí), chuyển sang thanh toán
      if (selectedPackage && selectedPackage.price > 0) {
        // Tạo FormData để upload hình ảnh trước
        const formDataToSend = new FormData();
        
        // Thêm thông tin room
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('province', formData.province);
        formDataToSend.append('district', formData.district);
        formDataToSend.append('ward', formData.ward);
        formDataToSend.append('area', formData.area);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('deposit', formData.deposit);
        formDataToSend.append('electricCost', formData.electricCost);
        formDataToSend.append('waterCost', formData.waterCost);
        formDataToSend.append('internetCost', formData.internetCost);
        formDataToSend.append('parkingCost', formData.parkingCost);
        formDataToSend.append('type', formData.propertyType);
        
        // Thêm amenities
        formData.amenities.forEach(amenity => {
          formDataToSend.append('amenities[]', amenity);
        });
        
        // Thêm hình ảnh
        formData.images.forEach(image => {
          formDataToSend.append('images', image);
        });

        console.log('Creating room for VIP post...');
        const roomResponse = await api.rooms.createRoom(formDataToSend);
        console.log('Room created:', roomResponse);

        // Chuẩn bị data để tạo post sau khi thanh toán
        const postDataForPayment = {
          roomId: roomResponse.data._id,
          options: formData.amenities,
          propertyType: formData.propertyType,
        };

        // Tạo payment URL
        console.log('Creating VIP payment...');
        const paymentResponse = await api.vipPostPayment.createPayment({
          vipPackage: formData.servicePackage,
          postData: postDataForPayment
        });

        console.log('Payment URL created:', paymentResponse);

        // Redirect đến VNPay
        if (paymentResponse.data?.paymentUrl) {
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          throw new Error('Không thể tạo link thanh toán');
        }
        
        return; // Dừng lại, chờ callback từ VNPay
      }

      // Nếu gói FREE, tạo post bình thường
      const formDataToSend = new FormData();
      
      // Thêm thông tin room
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('ward', formData.ward);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('deposit', formData.deposit);
      formDataToSend.append('electricCost', formData.electricCost);
      formDataToSend.append('waterCost', formData.waterCost);
      formDataToSend.append('internetCost', formData.internetCost);
      formDataToSend.append('parkingCost', formData.parkingCost);
      formDataToSend.append('type', formData.propertyType);
      
      // Thêm amenities
      formData.amenities.forEach(amenity => {
        formDataToSend.append('amenities[]', amenity);
      });
      
      // Thêm hình ảnh
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });

      console.log('Creating room...');
      const roomResponse = await api.rooms.createRoom(formDataToSend);
      console.log('Room created:', roomResponse);

      // Tạo post với room vừa tạo
      const postData = {
        roomId: roomResponse.data._id,
        options: formData.amenities,
        favouriteLevel: 'free',
      };

      console.log('Creating post with data:', postData);
      const postResponse = await api.dashboard.createPost(postData);
      console.log('Post created:', postResponse);
      
      toastManager.showSuccess('Đăng tin thành công! Tin của bạn đang chờ duyệt.');
      router.push('/dashboard/tin-dang');
    } catch (error: any) {
      console.error('Error creating post:', error);
      
      // Xử lý lỗi subscription
      if (error.message?.includes('LIMIT_EXCEEDED') || 
          error.message?.includes('đã hết lượt') ||
          error.message?.includes('hết lượt đăng tin') ||
          error.message?.includes('subscription')) {
        
        setSubscriptionInfo({
          packageName: 'Miễn phí',
          usedPosts: 3,
          postLimit: 3
        });
        setShowLimitModal(true);
        toastManager.showError('Bạn đã hết lượt đăng tin. Vui lòng nâng cấp gói để tiếp tục.');
      } else {
        toastManager.showError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Thông tin cơ bản';
      case 2: return 'Địa chỉ';
      case 3: return 'Thông tin chi tiết';
      case 4: return 'Hình ảnh';
      case 5: return 'Thông tin liên hệ';
      case 6: return 'Xác nhận và thanh toán';
      default: return '';
    }
  };

  const selectedPackage = servicePackages.find(pkg => pkg.value === formData.servicePackage);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step < currentStep ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  step
                )}
              </div>
              {step < 6 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Bước {currentStep}/6: {getStepTitle(currentStep)}
          </h2>
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Thông tin cơ bản */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bất động sản *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('propertyType', type.value)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.propertyType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <HomeIcon className="w-5 h-5 mx-auto mb-1" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hiển thị thông tin subscription hoặc gói VIP */}
            {loadingSubscription ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải thông tin gói...</p>
              </div>
            ) : userSubscription && userSubscription.canCreatePost ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Gói {userSubscription.packageName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Bạn đang sử dụng gói đăng ký có sẵn
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Đã sử dụng</p>
                        <p className="text-xl font-bold text-blue-600">
                          {userSubscription.usedPosts}/{userSubscription.postLimit}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Còn lại</p>
                        <p className="text-xl font-bold text-green-600">
                          {userSubscription.remainingPosts} lượt
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Hết hạn: {new Date(userSubscription.endDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gói dịch vụ
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicePackages.map((pkg) => (
                    <div
                      key={pkg.value}
                      onClick={() => handleInputChange('servicePackage', pkg.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.servicePackage === pkg.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{pkg.label}</h3>
                        <span className="text-lg font-bold text-green-600">
                          {pkg.price === 0 ? 'Miễn phí' : `${pkg.price.toLocaleString()}đ`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pkg.duration}</p>
                      <ul className="text-xs text-gray-500">
                        {pkg.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề tin đăng *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Cho thuê phòng trọ đầy đủ nội thất gần trường đại học..."
                maxLength={120}
              />
              <div className="mt-1 flex justify-end text-sm text-gray-500">
                <span>{formData.title.length}/120</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả chi tiết về phòng trọ: vị trí, tiện nghi, quy định..."
                maxLength={3000}
              />
              <div className="mt-1 flex justify-end text-sm text-gray-500">
                <span>{formData.description.length}/3000</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Địa chỉ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố *
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Hai Bà Trưng"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Phường Trần Hưng Đạo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ cụ thể *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Số 123, Ngõ 45, Đường Trần Khát Chân"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <MapPinIcon className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Lưu ý về địa chỉ:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Địa chỉ càng chi tiết càng dễ tìm thấy</li>
                    <li>• Nên ghi rõ gần trường học, bệnh viện, chợ...</li>
                    <li>• Không ghi địa chỉ ảo để tránh bị khóa tin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Thông tin chi tiết */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diện tích (m²) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá thuê (VNĐ/tháng) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3500000"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền cọc (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3500000"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chi phí phát sinh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền điện (VNĐ/số)
                  </label>
                  <input
                    type="number"
                    value={formData.electricCost}
                    onChange={(e) => handleInputChange('electricCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="4000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền nước (VNĐ/người/tháng)
                  </label>
                  <input
                    type="number"
                    value={formData.waterCost}
                    onChange={(e) => handleInputChange('waterCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internet (VNĐ/tháng)
                  </label>
                  <input
                    type="number"
                    value={formData.internetCost}
                    onChange={(e) => handleInputChange('internetCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giữ xe (VNĐ/tháng)
                  </label>
                  <input
                    type="number"
                    value={formData.parkingCost}
                    onChange={(e) => handleInputChange('parkingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tiện nghi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Hình ảnh */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh phòng trọ * (Tối đa 10 ảnh)
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
              >
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">
                    Nhấn để chọn ảnh hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG tối đa 5MB mỗi ảnh
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {formData.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Ảnh đã chọn ({formData.images.length}/10)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Ảnh đại diện
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Lưu ý về hình ảnh:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Ảnh đầu tiên sẽ là ảnh đại diện</li>
                    <li>• Nên chụp ảnh thật, rõ nét, đủ ánh sáng</li>
                    <li>• Chụp nhiều góc độ: phòng, nhà vệ sinh, khu vực chung</li>
                    <li>• Không sử dụng ảnh có logo, watermark</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Thông tin liên hệ */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên người liên hệ *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0987654321"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ liên hệ
              </label>
              <input
                type="text"
                value={formData.contactAddress}
                onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Địa chỉ để nhận hóa đơn (nếu có)"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Bảo mật thông tin:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Thông tin của bạn được bảo mật tuyệt đối</li>
                    <li>• Chỉ hiển thị khi có người quan tâm</li>
                    <li>• Có thể ẩn/hiện số điện thoại theo ý muốn</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Xác nhận và thanh toán */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xem trước tin đăng
              </h3>
              
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-start space-x-4">
                  {formData.images.length > 0 && (
                    <Image
                      src={URL.createObjectURL(formData.images[0])}
                      alt="Preview"
                      width={120}
                      height={90}
                      className="w-30 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                      {formData.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.address}, {formData.district}, {formData.province}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-green-600">
                        {parseInt(formData.price).toLocaleString()}đ/tháng
                      </span>
                      <span className="text-sm text-gray-500">
                        {formData.area}m²
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin thanh toán
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gói dịch vụ:</span>
                  <span className="font-medium">{selectedPackage?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian hiển thị:</span>
                  <span>{selectedPackage?.duration}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {selectedPackage?.price === 0 
                      ? 'Miễn phí' 
                      : `${selectedPackage?.price.toLocaleString()}đ`
                    }
                  </span>
                </div>
              </div>

              {selectedPackage?.price && selectedPackage.price > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Phương thức thanh toán
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="payment" defaultChecked className="mr-2" />
                      <span className="text-sm">Chuyển khoản ngân hàng</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="mr-2" />
                      <span className="text-sm">Ví điện tử (MoMo, ZaloPay)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Lưu ý quan trọng:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Tin đăng sẽ được kiểm duyệt trong vòng 24h</li>
                    <li>• Đảm bảo thông tin chính xác để tránh bị từ chối</li>
                    <li>• Không đăng tin trùng lặp</li>
                    <li>• Tuân thủ quy định đăng tin của website</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quay lại
          </button>
          
          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tiếp theo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                'Đăng tin'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal cảnh báo hết lượt đăng tin */}
      <PostLimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        packageName={subscriptionInfo?.packageName}
        usedPosts={subscriptionInfo?.usedPosts}
        postLimit={subscriptionInfo?.postLimit}
      />
    </div>
  );
}
