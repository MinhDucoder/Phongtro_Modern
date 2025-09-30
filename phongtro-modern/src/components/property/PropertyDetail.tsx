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
  HandRaisedIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { toastManager } from '@/components/ui/ToastManager';

interface PropertyDetailProps {
  property: {
    id?: string;
    _id?: string;
    title?: string;
    price?: number;
    area?: number;
    location?: string;
    address?: string;
    images?: string[];
    description?: string;
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
      images?: string[];
      amenities?: string[];
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

  const room = (property as any).room || (property as any).roomId || property;
  const images = Array.isArray(room?.images)
    ? room.images.flatMap((img: any) => (typeof img === 'string' ? img : img?.url || img))
    : Array.isArray((property as any).images)
      ? (property as any).images
      : [];
  const primaryImage = images[currentImageIndex] || '/placeholder-room.svg';
  const galleryImages = images.length > 0 ? images : ['/placeholder-room.svg'];
  const contact = property.contact || {
    name: property.landlord?.full_name || 'Chủ nhà',
    phone: property.landlord?.phone,
    email: property.landlord?.email,
    isVerified: property.landlord?.role === 'landlord',
    avatar: (property as any)?.landlord?.avatar && (property as any).landlord.avatar !== '/placeholder-room.svg'
      ? (property as any).landlord.avatar
      : undefined,
  };

  const price = room?.price ? `${room.price.toLocaleString()} VNĐ/tháng` : 'Giá liên hệ';
  const area = room?.area ? `${room.area} m²` : '—';
  const location = room?.city || property.location || '';

  useEffect(() => {
    setMounted(true);
    // TODO: replace with real authentication check
    setIsAuthenticated(true);
  }, []);

  const handleRequestToRent = () => {
    if (!isAuthenticated) {
      // Show login modal or redirect to login
      toastManager.showError('Vui lòng đăng nhập để gửi yêu cầu thuê');
      router.push('/dang-nhap?redirect=' + encodeURIComponent(`/phong-tro/${property.id}`));
      return;
    }

    // Navigate to request sent page
    router.push(`/yeu-cau-da-gui?propertyId=${property.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Enhanced Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                Trang chủ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/phong-tro" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                Phòng trọ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {room?.title || property.title || 'Tin đăng'}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <div className="relative h-[28rem] group">
                <Image
                  src={primaryImage}
                  alt={room?.title || 'Hình ảnh phòng'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Enhanced Badges */}
                {(property.isFeatured || property.favouriteLevel === 'gold' || property.favouriteLevel === 'platinum') && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <StarSolidIcon className="w-4 h-4 inline mr-1" />
                    Tin nổi bật
                  </div>
                )}
                
                {/* Enhanced Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="bg-white/90 hover:bg-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-700" />
                    )}
                  </button>
                  <button className="bg-white/90 hover:bg-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg">
                    <ShareIcon className="w-6 h-6 text-gray-700" />
                  </button>
                </div>

                {/* Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryImages.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev < galleryImages.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                )}
              </div>
              
              {/* Enhanced Image Thumbnails */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image || '/placeholder-room.svg'}
                        alt={`Ảnh ${index + 1}`}
                        width={120}
                        height={90}
                        className={`object-cover rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                          currentImageIndex === index 
                            ? 'ring-2 ring-blue-500 shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      {index === 3 && galleryImages.length > 4 && (
                        <div 
                          className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer rounded-lg hover:bg-black/70 transition-colors"
                          onClick={() => setShowAllImages(true)}
                        >
                          <div className="text-center text-white">
                            <PlusIcon className="w-8 h-8 mx-auto mb-1" />
                            <span className="text-sm font-medium">
                              +{galleryImages.length - 4} ảnh
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Property Info */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              {/* Stats and Meta Info */}
              <div className="flex flex-wrap items-center justify-between mb-6">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {(property.analytics?.views || property.viewCount || 0).toLocaleString()} lượt xem
                    </span>
                  </div>
                  {property.updatedAt && (
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        Cập nhật: {new Date(property.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  {property.status === 'active' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Đang cho thuê
                    </span>
                  )}
                  {property.favouriteLevel && property.favouriteLevel !== 'free' && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {property.favouriteLevel === 'gold' ? 'Vàng' : 
                       property.favouriteLevel === 'platinum' ? 'Bạch kim' : 'Bạc'}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {room?.title || property.title || 'Tin đăng'}
              </h1>

              {/* Price and Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-1">Giá thuê</div>
                  <div className="text-4xl font-bold text-green-600">
                    {price}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-1">Diện tích</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {area}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start mb-8 p-4 bg-gray-50 rounded-xl">
                <MapPinIcon className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{location}</p>
                  <p className="text-gray-700">{room?.address || property.address}</p>
                </div>
              </div>

              {/* Enhanced Description */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                  Mô tả chi tiết
                </h2>
                <div className="prose max-w-none">
                  {(room?.description || property.description || '')
                    .split('\n')
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            {/* Enhanced Amenities */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircleIcon className="w-6 h-6 mr-3 text-green-600" />
                Tiện nghi có sẵn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(room?.amenities || property.amenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Rules */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-3 text-orange-600" />
                Nội quy phòng
              </h2>
              {Array.isArray(room?.rules) && room.rules.length > 0 ? (
                <div className="space-y-4">
                  {room.rules.map((rule: string, index: number) => (
                    <div key={index} className="flex items-start p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <XCircleIcon className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900 font-medium">{rule}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa cập nhật nội quy.</p>
                </div>
              )}
            </div>

            {/* Enhanced Nearby Places */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPinIcon className="w-6 h-6 mr-3 text-blue-600" />
                Địa điểm lân cận
              </h2>
              {Array.isArray(room?.nearbyPlaces) && room.nearbyPlaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.nearbyPlaces.map((place: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="text-blue-600 mr-3">
                          {getPlaceIcon(place.type)}
                        </div>
                        <span className="text-gray-900 font-medium">{place.name}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {place.distance}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa cập nhật địa điểm lân cận.</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Contact Card */}
            <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 sticky top-8">
              {/* Landlord Info */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <Image
                    src={contact?.avatar || '/placeholder-room.svg'}
                    alt={contact?.name || 'Chủ nhà'}
                    width={70}
                    height={70}
                    className="rounded-full border-4 border-blue-100"
                  />
                  {contact?.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="font-bold text-gray-900 text-lg">{contact?.name || 'Chủ nhà'}</h3>
                    {contact?.isVerified && (
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Đã xác thực
                      </span>
                    )}
                  </div>
                  {contact?.joinedDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tham gia: {contact.joinedDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Primary Action */}
                <button
                  onClick={handleRequestToRent}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <HandRaisedIcon className="w-6 h-6 mr-3" />
                  Gửi yêu cầu thuê
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`tel:${contact?.phone || ''}`}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Gọi
                  </Link>
                  
                  <Link
                    href="/chat"
                    className="bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                    Chat
                  </Link>
                </div>

                {/* Additional Actions */}
                <button className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-3 px-4 rounded-lg font-medium transition-all duration-200">
                  Xem thêm tin của {contact?.name || 'chủ nhà'}
                </button>
              </div>

              {/* Enhanced Safety Tips */}
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <h4 className="font-bold text-yellow-800 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  Lưu ý an toàn
                </h4>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Không chuyển tiền trước khi xem phòng</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Kiểm tra giấy tờ chủ nhà</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Thỏa thuận rõ ràng về tiền cọc</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Image Modal */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-bold">
                Ảnh {currentImageIndex + 1} / {galleryImages.length}
              </h3>
              <button
                onClick={() => setShowAllImages(false)}
                className="text-white hover:text-gray-300 text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Main Image */}
            <div className="relative h-[60vh] mb-6 rounded-xl overflow-hidden">
              <Image
                src={galleryImages[currentImageIndex] || '/placeholder-room.svg'}
                alt={`Ảnh ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
              
              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryImages.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev < galleryImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-8 gap-3">
              {galleryImages?.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image || '/placeholder-room.svg'}
                    alt={`Thumbnail ${index + 1}`}
                    width={100}
                    height={75}
                    className={`object-cover rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-white shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
