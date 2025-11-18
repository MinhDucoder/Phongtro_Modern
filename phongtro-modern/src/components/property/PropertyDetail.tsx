'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon, 
  ShareIcon, 
  FlagIcon,
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
  MagnifyingGlassIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { toastManager } from '@/components/ui/ToastManager';
import { useAuth } from '@/contexts/AuthContext';
import OpenStreetMap from '@/components/map/OpenStreetMap';
import PropertyReviews from '@/components/review/PropertyReviews';
import EnhancedLandlordCard from '@/components/property/EnhancedLandlordCard';
import { savedPropertiesApi, rsApi } from '@/lib/api';
import ReportModal, { ReportTarget } from '@/components/report/ReportModal';

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

const getAmenityLabel = (amenity: string): string => {
  const amenityMap: Record<string, string> = {
    'wifi': 'Wifi miễn phí',
    'aircon': 'Điều hòa',
    'private_wc': 'WC riêng',
    'washing_machine': 'Máy giặt',
    'fridge': 'Tủ lạnh',
    'balcony': 'Ban công',
    'window': 'Cửa sổ',
    'kitchen': 'Bếp riêng'
  };
  return amenityMap[amenity] || amenity;
};

const getPlaceIcon = (type: string) => {
  const iconMap: Record<string, React.ReactElement> = {
    'university': <AcademicCapIcon className="w-5 h-5" />,
    'school': <AcademicCapIcon className="w-5 h-5" />,
    'market': <BuildingStorefrontIcon className="w-5 h-5" />,
    'supermarket': <BuildingStorefrontIcon className="w-5 h-5" />,
    'hospital': <HeartIcon className="w-5 h-5" />,
    'park': <MapPinIcon className="w-5 h-5" />,
    'bus_station': <TruckIcon className="w-5 h-5" />
  };
  return iconMap[type] || <MapPinIcon className="w-5 h-5" />;
};

const getPlaceTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'university': 'Trường học',
    'school': 'Trường học',
    'market': 'Chợ',
    'supermarket': 'Siêu thị',
    'hospital': 'Bệnh viện',
    'park': 'Công viên',
    'bus_station': 'Bến xe',
    'nearby': 'Địa điểm lân cận'
  };
  return labelMap[type] || 'Địa điểm';
};

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'reviews'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState<boolean>(false);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  // PropertyDetailPage đã normalize data, tin tưởng nó
  const room = property.room || {};
  const images = Array.isArray(room.images)
    ? room.images.flatMap((img: any) => (typeof img === 'string' ? img : img?.url || img))
    : [];
  const primaryImage = images[currentImageIndex] || '/placeholder-room.svg';
  const galleryImages = images.length > 0 ? images : ['/placeholder-room.svg'];
  const contact = property.contact || { name: 'Chủ nhà' };

  const price = room?.price ? `${room.price.toLocaleString()} VNĐ/tháng` : 'Giá liên hệ';
  const area = room?.area ? `${room.area} m²` : '—';
  const location = room?.city || property.location || '';
  
  // Check if current user is owner
  const isOwner = user?._id && (property.landlord as any)?._id && user._id === (property.landlord as any)._id;

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: room?.title || property.title || 'Phòng trọ',
      text: `Xem phòng trọ này: ${room?.title || property.title || 'Phòng trọ'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toastManager.showSuccess('Đã chia sẻ thành công!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toastManager.showSuccess('Đã sao chép link vào clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toastManager.showError('Không thể chia sẻ. Vui lòng thử lại.');
    }
  };

  const openReportModal = (targetType: 'post' | 'user') => {
    const postId = property._id || property.id;
    if (!postId) {
      toastManager.showError('Không xác định được mã tin đăng để báo cáo');
      return;
    }

    if (!isAuthenticated) {
      toastManager.showError('🔐 Vui lòng đăng nhập để gửi báo cáo');
      const redirectPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : `/phong-tro/${postId}`;
      router.push('/dang-nhap?redirect=' + encodeURIComponent(redirectPath));
      return;
    }

    const landlordId = (property.landlord as any)?._id;
    if (targetType === 'user' && !landlordId) {
      toastManager.showError('Không thể báo cáo người dùng này');
      return;
    }

    const targetConfig: ReportTarget = {
      targetId: targetType === 'post' ? (postId as string) : (landlordId as string),
      targetType,
      targetName:
        targetType === 'post'
          ? room?.title || property.title || 'Tin đăng'
          : property.landlord?.full_name || contact?.name || 'Người dùng',
      targetDescription:
        targetType === 'post'
          ? room?.address || property.address || ''
          : property.landlord?.email || contact?.email || '',
    };

    setReportTarget(targetConfig);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportTarget(null);
  };

  // Save functionality
  const handleSave = async () => {
    if (!isAuthenticated) {
      toastManager.showError('🔐 Vui lòng đăng nhập để lưu tin đăng');
      router.push('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (isOwner) {
      toastManager.showError('🚫 Bạn không thể lưu tin đăng của chính mình');
      return;
    }

    try {
      setIsSaving(true);
      const postId = property._id || property.id;
      
      if (!postId) {
        toastManager.showError('Không tìm thấy ID tin đăng');
        return;
      }
      
      if (isSaved) {
        if (!favoriteId) {
          toastManager.showError('Không tìm thấy mã lưu tin để hủy lưu.');
          return;
        }
        await savedPropertiesApi.removeProperty(favoriteId);
        setIsSaved(false);
        setFavoriteId(null);
        toastManager.showSuccess('💔 Đã bỏ lưu tin đăng');
      } else {
        const response = await savedPropertiesApi.saveProperty(postId);
        const savedFavoriteId =
          (response.data as any)?.favorite?._id ||
          (response as any)?.favorite?._id ||
          null;
        if (savedFavoriteId) {
          setFavoriteId(savedFavoriteId);
        }
        setIsSaved(true);
        toastManager.showSuccess('❤️ Đã lưu tin đăng vào danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('Error saving property:', error);
      toastManager.showError(error.message || 'Không thể lưu tin đăng. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const postId = property._id || property.id;
    if (!postId || !isAuthenticated) {
      setIsSaved(false);
      setFavoriteId(null);
      return;
    }
    let isMountedEffect = true;
    (async () => {
      try {
        const response = await savedPropertiesApi.checkSavedStatus(postId);
        const payload = (response.data as any) || response;
        if (!isMountedEffect) return;
        const saved = !!(payload?.isSaved);
        setIsSaved(saved);
        setFavoriteId(saved ? payload?.favoriteId || null : null);
      } catch (error) {
        console.error('Không thể kiểm tra trạng thái lưu tin:', error);
        if (isMountedEffect) {
          setIsSaved(false);
          setFavoriteId(null);
        }
      }
    })();
    return () => {
      isMountedEffect = false;
    };
  }, [isAuthenticated, property._id, property.id]);

  // Fetch recommendations
  useEffect(() => {
    const postId = property._id || property.id;
    if (!postId) return;

    let isActive = true;
    (async () => {
      try {
        setRecsLoading(true);
        setRecsError(null);
        const resp = await rsApi.recommendPosts(postId as string, 6);
        if (!isActive) return;
        if (resp?.success && Array.isArray(resp.data)) {
          setRecs(resp.data as any[]);
        } else {
          setRecs([]);
        }
      } catch (e: any) {
        if (isActive) setRecsError(e?.message || 'Không thể tải gợi ý.');
      } finally {
        if (isActive) setRecsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [property._id, property.id]);

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!showAllImages) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAllImages(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryImages.length - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => prev < galleryImages.length - 1 ? prev + 1 : 0);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAllImages, galleryImages.length]);


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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
              <div className="relative h-[28rem] group bg-gradient-to-br from-gray-900 to-gray-800">
                <Image
                  src={primaryImage}
                  alt={room?.title || 'Hình ảnh phòng'}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
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
                <div className="absolute top-6 right-6 flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="backdrop-blur-sm bg-white/85 hover:bg-white p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isSaved ? "Bỏ lưu tin đăng" : "Lưu tin đăng"}
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
                    ) : isSaved ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-700" />
                    )}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="backdrop-blur-sm bg-white/85 hover:bg-white p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm border border-white/40"
                    aria-label="Chia sẻ phòng trọ"
                  >
                    <ShareIcon className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => openReportModal('post')}
                    className="backdrop-blur-sm bg-white/85 hover:bg-white p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm border border-white/40"
                    aria-label="Báo cáo tin đăng"
                  >
                    <FlagIcon className="w-6 h-6 text-red-500" />
                  </button>
                </div>

                {/* Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryImages.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-sm bg-white/90 hover:bg-white p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md border border-white/40 opacity-0 group-hover:opacity-100"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev < galleryImages.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-sm bg-white/90 hover:bg-white p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md border border-white/40 opacity-0 group-hover:opacity-100"
                      aria-label="Ảnh tiếp"
                    >
                      <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 backdrop-blur-sm bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border border-white/10">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                )}
              </div>
              
              {/* Enhanced Image Thumbnails */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-5 gap-2">
                  {galleryImages.slice(0, 5).map((image: string, index: number) => (
                    <div key={index} className="relative group w-full aspect-[4/3]">
                      <Image
                        src={image || '/placeholder-room.svg'}
                        alt={`Ảnh ${index + 1} - ${room?.title || 'Phòng trọ'}`}
                        fill
                        sizes="(max-width: 768px) 20vw, 15vw"
                        className={`object-cover rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                          currentImageIndex === index 
                            ? 'ring-2 ring-blue-500 shadow-md scale-105' 
                            : 'hover:shadow-sm'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      {index === 4 && galleryImages.length > 5 && (
                        <div 
                          className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer rounded-lg hover:bg-black/70 transition-colors z-10"
                          onClick={() => setShowAllImages(true)}
                        >
                          <div className="text-center text-white">
                            <PlusIcon className="w-8 h-8 mx-auto mb-1" />
                            <span className="text-sm font-medium">
                              +{galleryImages.length - 5}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24 place-self-start">
            <EnhancedLandlordCard
              landlord={{
                _id: (property.landlord as any)?._id || 'unknown',
                full_name: contact?.name || 'Chủ nhà',
                phone: contact?.phone,
                email: contact?.email,
                avatar: (property.landlord as any)?.avatar || contact?.avatar,
                role: property.landlord?.role || 'landlord',
                is_verified: contact?.isVerified || false,
                responseTime: 'Trong vòng 1 giờ',
                onlineStatus: 'online' as const,
                last_login: (property.landlord as any)?.last_login,
              }}
              propertyId={property._id || property.id || ''}
              onReportPost={() => openReportModal('post')}
            />
          </div>
        </div>

        {/* Tab Navigation - Moved below image gallery */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: HomeIcon },
                  { id: 'map', label: 'Bản đồ', icon: MapPinIcon },
                  { id: 'reviews', label: 'Đánh giá', icon: StarIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <tab.icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Property Basic Info */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              {/* Stats and Meta Info */}
                      <div className="flex flex-wrap items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {(property.analytics?.views || property.viewCount || 0).toLocaleString()} lượt xem
                    </span>
                  </div>
                          {(property as any).updatedAt && (
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                                Cập nhật: {new Date((property as any).updatedAt).toLocaleDateString('vi-VN')}
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
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {room?.title || property.title || 'Tin đăng'}
              </h1>

              {/* Price and Area */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 shadow-sm hover:shadow transition-all">
                          <div className="text-xs font-semibold text-emerald-700 mb-1">Giá thuê</div>
                          <div className="text-2xl font-bold text-emerald-600">
                              {price}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow transition-all">
                          <div className="text-xs font-semibold text-blue-700 mb-1">Diện tích</div>
                          <div className="text-2xl font-bold text-blue-600">
                              {area}
                            </div>
                        </div>
                      </div>

              {/* Location */}
                      <div className="flex items-start p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500 shadow-sm">
                        <MapPinIcon className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 mb-1">{location}</p>
                          <p className="text-gray-600 text-sm">{room?.address || property.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Mô tả chi tiết
                      </h2>
                      <div className="prose max-w-none">
                        {((room as any)?.description || property.description || '')
                          .split('\n')
                          .filter(Boolean)
                          .map((paragraph: string, index: number) => (
                            <p key={index} className="text-gray-700 leading-relaxed text-sm mb-3 whitespace-pre-line">
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    </div>

            </div>

                  {/* Right Column - Amenities & Rules */}
                  <div className="space-y-4">
                    {/* Amenities */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-emerald-600" />
                        Tiện nghi
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(room?.amenities || property.amenities || []).map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200 hover:shadow transition-all">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-900 font-medium text-sm">{getAmenityLabel(amenity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-600" />
                        Nội quy
                      </h2>
                      {Array.isArray((room as any)?.rules) && (room as any).rules.length > 0 ? (
                        <div className="space-y-2">
                          {(room as any).rules.map((rule: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-200 hover:shadow transition-all">
                              <XCircleIcon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-900 font-medium text-sm">{rule}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <ExclamationTriangleIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Chưa cập nhật nội quy.</p>
                        </div>
                      )}
                    </div>

                    {/* Nearby Places */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Địa điểm lân cận
                      </h2>
                      {(() => {
                        const nearbyPlaces = (room as any)?.nearbyPlaces || property.nearbyPlaces || [];
                        return Array.isArray(nearbyPlaces) && nearbyPlaces.length > 0 ? (
                          <div className="space-y-2">
                            {nearbyPlaces.map((place: any, index: number) => {
                      // Xử lý dữ liệu bị lỗi format (string bị split thành object với keys là số)
                      let placeName = '';
                      let placeType = '';
                      let placeDistance = '';
                      
                      if (place.name && typeof place.name === 'string') {
                        // Dữ liệu đúng format
                        placeName = place.name;
                        placeType = place.type || '';
                        placeDistance = place.distance || '';
                      } else if (typeof place === 'object' && place !== null) {
                        // Dữ liệu bị lỗi format - string bị split thành object
                        const keys = Object.keys(place).filter(key => !isNaN(Number(key))).sort((a, b) => Number(a) - Number(b));
                        if (keys.length > 0) {
                          placeName = keys.map(key => place[key]).join('');
                          placeType = 'nearby'; // Default type
                          placeDistance = 'Gần đây';
                        }
                      }
                      
                              return (
                                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:shadow transition-all">
                                  <div className="flex items-center gap-2">
                                    <div className="text-blue-600">
                                      {getPlaceIcon(placeType)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-900 font-medium text-sm">
                                        {placeName || getPlaceTypeLabel(placeType) || 'Địa điểm'}
                                      </span>
                                      {placeName && placeType && placeName !== getPlaceTypeLabel(placeType) && (
                                        <span className="text-xs text-blue-600">{getPlaceTypeLabel(placeType)}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    {placeDistance}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <MapPinIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Chưa cập nhật địa điểm lân cận.</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'map' && (
                <div className="space-y-4">
                  {/* Simple Map */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Vị trí phòng</h3>
                    <OpenStreetMap
                      roomId={property._id || property.id || ''}
                      height="400px"
                    />
                  </div>
                </div>
              )}


              {activeTab === 'reviews' && (
                <PropertyReviews
                  propertyId={property._id || property.id || ''}
                  isOwner={isOwner}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Image Modal */}
  {/* Recommendations - separate section below tabs */}
  <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:px-8">
    <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <StarIcon className="w-6 h-6 mr-2 text-yellow-500" />
          Gợi ý tương tự
        </h2>
        <p className="text-sm text-gray-600 mt-1">Những phòng trọ có thể phù hợp với bạn</p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {recsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="h-40 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!recsLoading && recsError && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <div className="text-red-600 font-semibold mb-2">Không thể tải gợi ý</div>
            <div className="text-sm text-gray-600">{recsError}</div>
          </div>
        )}
        
        {!recsLoading && !recsError && (
          Array.isArray(recs) && recs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recs.map((item: any) => {
                const r = item?.room || {};
                const img = Array.isArray(r.images) && r.images.length > 0 ? (typeof r.images[0] === 'string' ? r.images[0] : r.images[0]?.url) : '/placeholder-room.svg';
                return (
                  <Link 
                    key={item._id} 
                    href={`/phong-tro/${item._id}`} 
                    className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-40 overflow-hidden bg-gray-200">
                      <Image 
                        src={img || '/placeholder-room.svg'} 
                        alt={r.title || 'Gợi ý'} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {r.title || 'Tin đăng'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{r.address || 'Chưa cập nhật địa chỉ'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="text-lg font-bold text-green-600">
                          {r.price ? `${Number(r.price).toLocaleString('vi-VN')}đ` : 'Giá liên hệ'}
                        </div>
                        {r.area && (
                          <div className="text-sm text-gray-600 font-medium">
                            {r.area}m²
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Không có gợi ý phù hợp.</p>
              <p className="text-sm text-gray-500 mt-1">Hãy thử lại sau</p>
            </div>
          )
        )}
      </div>
    </div>
  </div>

  {/* Enhanced Image Modal */}
      {showAllImages && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="max-w-6xl w-full max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 id="modal-title" className="text-white text-xl font-bold">
                Ảnh {currentImageIndex + 1} / {galleryImages.length}
              </h3>
              <button
                onClick={() => setShowAllImages(false)}
                className="text-white hover:text-gray-300 text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Đóng modal"
              >
                ×
              </button>
            </div>
            
            {/* Main Image */}
            <div className="relative h-[60vh] mb-6 rounded-xl overflow-hidden">
              <Image
                src={galleryImages[currentImageIndex] || '/placeholder-room.svg'}
                alt={`Ảnh ${currentImageIndex + 1} - ${room?.title || 'Phòng trọ'}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                className="object-contain"
              />
              
              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryImages.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev < galleryImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                    aria-label="Ảnh tiếp"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-8 gap-3">
              {galleryImages?.map((image: string, index: number) => (
                <div key={index} className="relative w-full aspect-[4/3]">
                  <Image
                    src={image || '/placeholder-room.svg'}
                    alt={`Thumbnail ${index + 1} - ${room?.title || 'Phòng trọ'}`}
                    fill
                    sizes="(max-width: 768px) 12vw, 10vw"
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

      <ReportModal
        isOpen={isReportModalOpen}
        target={reportTarget}
        onClose={closeReportModal}
      />
    </div>
  );
}
