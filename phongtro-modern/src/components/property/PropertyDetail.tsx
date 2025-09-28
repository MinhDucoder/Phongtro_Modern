'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon, 
  ShareIcon, 
  MapPinIcon, 
  EyeIcon, 
  CalendarIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  AcademicCapIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { toastManager } from '@/components/ui/ToastManager';
import { rentalRequestApi } from '@/lib/api';

interface PropertyDetailProps {
  property: {
    id?: string;
    _id?: string;
    title?: string;
    price?: number;
    area?: number;
    location?: string;
    address?: string;
    images?: string[] | any[];
    description?: string;
    propertyType?: string;
    roomType?: string;
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
      isVerified?: boolean;
      joinedDate?: string;
      avatar?: string;
    };
    postedTime?: string;
    viewCount?: number;
    isFeatured?: boolean;
    amenities?: string[];
    rules?: string[];
    nearbyPlaces?: Array<{
      name: string;
      distance: string;
      type: 'university' | 'market' | 'hospital' | 'supermarket' | string;
    }>;
    room?: {
      title?: string;
      price?: number;
      area?: number;
      address?: string;
      city?: string;
      images?: string[] | any[];
      amenities?: string[];
      propertyType?: string;
      roomType?: string;
      description?: string;
    };
    roomId?: {
      title?: string;
      price?: number;
      area?: number;
      address?: string;
      city?: string;
      images?: string[] | any[];
      amenities?: string[];
      propertyType?: string;
      roomType?: string;
      description?: string;
    };
    landlord?: {
      full_name?: string;
      phone?: string;
      email?: string;
      role?: string;
    };
    status?: string;
    favouriteLevel?: string;
    options?: string[];
    analytics?: {
      views?: number;
      likes?: number;
      calls?: number;
      messages?: number;
    };
  };
}

const getPlaceIcon = (type: string) => {
  switch (type) {
    case 'university': return <AcademicCapIcon className="w-5 h-5" />;
    case 'market': 
    case 'supermarket': return <BuildingStorefrontIcon className="w-5 h-5" />;
    default: return <HomeIcon className="w-5 h-5" />;
  }
};

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock auth state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    message: '',
    expectedMoveIn: '',
    contactInfo: {
      phone: '',
      email: ''
    }
  });

  const room = property.roomId || property.room || property;
  
  // Process images - handle both string URLs and objects with url property
  const processedImages = Array.isArray(room?.images) 
    ? room.images.map((img: any) => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img.url) return img.url;
        return '/placeholder-room.svg';
      })
    : [];
  
  const images = processedImages.length > 0 ? processedImages : ['/placeholder-room.svg'];
  const primaryImage = images[currentImageIndex] || '/placeholder-room.svg';
  const galleryImages = images;
  
  const contact = property.contact || {
    name: property.landlord?.full_name || 'Chủ nhà',
    phone: property.landlord?.phone,
    email: property.landlord?.email,
    isVerified: property.landlord?.role === 'landlord',
  };

  const price = room?.price ? `${room.price.toLocaleString()} VNĐ/tháng` : 'Giá liên hệ';
  const area = room?.area ? `${room.area} m²` : '—';
  const location = room?.city || property.location || '';
  const propertyType = room?.propertyType || property.propertyType || '';
  const roomType = room?.roomType || property.roomType || '';
  const amenities = room?.amenities || property.amenities || [];
  const description = room?.description || property.description || '';
  const address = room?.address || property.address || '';
  const viewCount = property.analytics?.views || property.viewCount || 0;

  useEffect(() => {
    setMounted(true);
    // TODO: replace with real authentication check
    setIsAuthenticated(true);
  }, []);

  const handleRequestToRent = () => {
    if (!isAuthenticated) {
      // Show login modal or redirect to login
      toastManager.showError('Vui lòng đăng nhập để gửi yêu cầu thuê');
      router.push('/dang-nhap?redirect=' + encodeURIComponent(`/phong-tro/${property.id || property._id}`));
      return;
    }

    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestData.message.trim() || !requestData.expectedMoveIn) {
      toastManager.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const response = await rentalRequestApi.createRequest({
        postId: property.id || property._id || '',
        message: requestData.message,
        expectedMoveIn: requestData.expectedMoveIn,
        contactInfo: requestData.contactInfo
      });

      if (response) {
        toastManager.showSuccess('Đã gửi yêu cầu thuê thành công!');
        setShowRequestModal(false);
        setRequestData({
          message: '',
          expectedMoveIn: '',
          contactInfo: { phone: '', email: '' }
        });
        // Navigate to request sent page
        router.push(`/yeu-cau-da-gui?propertyId=${property.id || property._id}`);
      }
    } catch (error) {
      console.error('Error creating rental request:', error);
      toastManager.showError('Có lỗi xảy ra khi gửi yêu cầu');
    }
  };


  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-gray-900">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="h-96 bg-gray-200"></div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-800">
            <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
            <li>/</li>
            <li><Link href="/phong-tro" className="hover:text-blue-600">Phòng trọ</Link></li>
            <li>/</li>
            <li className="text-gray-900 truncate">{room?.title || property.title || 'Tin đăng'}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-96">
                <Image
                  src={primaryImage}
                  alt={room?.title || 'Hình ảnh phòng'}
                  fill
                  className="object-cover"
                />
                {(property.isFeatured || property.favouriteLevel === 'gold' || property.favouriteLevel === 'platinum') && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                    Tin nổi bật
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-900" />
                    )}
                  </button>
                  <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                    <ShareIcon className="w-6 h-6 text-gray-900" />
                  </button>
                </div>
              </div>
              
              {/* Image Thumbnails */}
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image || '/placeholder-room.svg'}
                        alt={`Ảnh ${index + 1}`}
                        width={100}
                        height={80}
                        className={`object-cover rounded cursor-pointer transition-opacity ${
                          currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      {index === 3 && galleryImages.length > 4 && (
                        <div 
                          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer rounded"
                          onClick={() => setShowAllImages(true)}
                        >
                          <span className="text-white font-medium">
                            <PlusIcon className="w-6 h-6 mx-auto mb-1" />
                            {galleryImages.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-800">
                  <div className="flex items-center">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {(property.analytics?.views || property.viewCount || 0).toLocaleString()} lượt xem
                  </div>
                  {property.updatedAt && (
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Cập nhật: {new Date(property.updatedAt).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {room?.title || property.title || 'Tin đăng'}
              </h1>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="text-3xl font-bold text-green-600">
                    {price}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium text-gray-900">
                    Diện tích: {area}
                  </span>
                </div>
              </div>

              <div className="flex items-start mb-6">
                <MapPinIcon className="w-5 h-5 text-gray-600 mr-2 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{location}</p>
                  <p className="text-gray-900 text-sm">{room?.address || property.address}</p>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mô tả chi tiết</h2>
                <div className="prose max-w-none">
                  {(room?.description || property.description || '')
                    .split('\n')
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index} className="mb-3 text-gray-900 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tiện nghi</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(room?.amenities || property.amenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-900">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội quy</h2>
              <div className="space-y-3">
                {(property.rules || []).map((rule, index) => (
                  <div key={index} className="flex items-start">
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Places */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Địa điểm lân cận</h2>
              <div className="space-y-3">
                {(property.nearbyPlaces || []).map((place, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="text-gray-600 mr-3">
                        {getPlaceIcon(place.type)}
                      </div>
                      <span className="text-gray-900">{place.name}</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <div className="flex items-center mb-4">
                <Image
                  src={contact?.avatar || '/placeholder-avatar.svg'}
                  alt={contact?.name || 'Chủ nhà'}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900">{contact?.name || 'Chủ nhà'}</h3>
                    {contact?.isVerified && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-500 ml-2" />
                    )}
                  </div>
                  {contact?.joinedDate && <p className="text-sm text-gray-800">{contact.joinedDate}</p>}
                </div>
              </div>

              <div className="space-y-3">
                {/* Request to Rent Button */}
                <button
                  onClick={handleRequestToRent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <HandRaisedIcon className="w-5 h-5 mr-2" />
                  Gửi yêu cầu thuê
                </button>

                <Link
                  href={`tel:${contact?.phone || ''}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  {contact?.phone || 'Liên hệ'}
                </Link>
                
              <Link
                href="/chat"
                className="w-full bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                  Nhắn tin
                </Link>

                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors">
                  Xem thêm tin của {contact?.name || 'chủ nhà'}
                </button>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Lưu ý an toàn</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Không chuyển tiền trước khi xem phòng</li>
                  <li>• Kiểm tra giấy tờ chủ nhà</li>
                  <li>• Thỏa thuận rõ ràng về tiền cọc</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">
                Ảnh {currentImageIndex + 1} / {property.images.length}
              </h3>
              <button
                onClick={() => setShowAllImages(false)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="relative h-96 mb-4">
              <Image
                src={property.images[currentImageIndex] || '/placeholder-room.svg'}
                alt={`Ảnh ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {property.images?.map((image, index) => (
                <Image
                  key={index}
                  src={image || '/placeholder-room.svg'}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className={`object-cover rounded cursor-pointer ${
                    currentImageIndex === index ? 'ring-2 ring-white' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gửi yêu cầu thuê phòng
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tin nhắn cho chủ nhà *
                </label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Xin chào, tôi quan tâm đến phòng trọ này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày dự kiến chuyển vào *
                </label>
                <input
                  type="date"
                  value={requestData.expectedMoveIn}
                  onChange={(e) => setRequestData(prev => ({ ...prev, expectedMoveIn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={requestData.contactInfo.phone}
                    onChange={(e) => setRequestData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={requestData.contactInfo.email}
                    onChange={(e) => setRequestData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
