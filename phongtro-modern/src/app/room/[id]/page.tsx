'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPinIcon,
  CurrencyDollarIcon,
  Square3Stack3DIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';
import ReportModal, { ReportTarget } from '@/components/report/ReportModal';
import { useAuth } from '@/contexts/AuthContext';

interface Room {
  _id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  city: string;
  address: string;
  images: any[];
  amenities: string[];
  rules: string[];
  nearbyPlaces: any[];
  createdAt: string;
}

interface Post {
  _id: string;
  roomId: Room;
  landlord: {
    _id: string;
    full_name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  status: string;
  createdAt: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const roomId = params?.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        
        // Gọi API để lấy post với room details
        const response = await fetch(`http://localhost:5000/api/v1/posts?limit=1`);
        const data = await response.json();
        
        if (data.success && data.data.items) {
          // Tìm post với roomId phù hợp
          const foundPost = data.data.items.find((p: any) => p.roomId?._id === roomId);
          if (foundPost) {
            setPost(foundPost);
          } else {
            toastManager.showError('Không tìm thấy phòng');
            router.push('/phong-tro');
          }
        }
      } catch (error) {
        console.error('Error fetching room detail:', error);
        toastManager.showError('Lỗi khi tải thông tin phòng');
        router.push('/phong-tro');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [roomId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy phòng</h1>
          <Link href="/phong-tro" className="text-blue-600 hover:text-blue-700">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const room = post.roomId;
  const landlord = post.landlord;
  const images = room.images || [];
  const currentImage = images.length > 0 ? (typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : images[currentImageIndex]?.url) : '';

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + ' triệu';
    }
    return price.toLocaleString() + ' đ';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openReportModal = (targetType: 'post' | 'user') => {
    if (!post) return;

    if (!isAuthenticated) {
      toastManager.showError('Vui lòng đăng nhập để gửi báo cáo');
      try {
        const redirectPath =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/';
        router.push(`/dang-nhap?redirect=${encodeURIComponent(redirectPath)}`);
      } catch {
        router.push('/dang-nhap');
      }
      return;
    }

    if (targetType === 'user' && !post.landlord?._id) {
      toastManager.showError('Không thể báo cáo người dùng này');
      return;
    }

    const targetConfig: ReportTarget = {
      targetId: targetType === 'post' ? post._id : (post.landlord?._id as string),
      targetType,
      targetName: targetType === 'post' ? room.title : post.landlord?.full_name || 'Người dùng',
      targetDescription:
        targetType === 'post'
          ? `Địa chỉ: ${room.address}`
          : `Email: ${post.landlord?.email || 'Không xác định'}`,
    };

    setReportTarget(targetConfig);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportTarget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900 line-clamp-2">{room.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Info */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6 rounded-lg overflow-hidden bg-white shadow-sm">
              {currentImage ? (
                <div className="relative h-96 bg-gray-200">
                  <Image
                    src={currentImage}
                    alt={room.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-96 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Không có hình ảnh</span>
                </div>
              )}

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((image, idx) => {
                    const imgSrc = typeof image === 'string' ? image : image?.url;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 relative h-20 w-20 rounded border-2 overflow-hidden ${
                          idx === currentImageIndex ? 'border-blue-600' : 'border-gray-300'
                        }`}
                      >
                        <Image
                          src={imgSrc}
                          alt={`Image ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-500">Giá thuê</p>
                    <p className="text-lg font-bold text-red-600">{formatPrice(room.price)}/tháng</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Square3Stack3DIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Diện tích</p>
                    <p className="text-lg font-bold text-gray-900">{room.area} m²</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Tỉnh/Thành phố</p>
                    <p className="text-lg font-bold text-gray-900">{room.city}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 whitespace-pre-line">{room.description}</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Địa chỉ
              </h3>
              <p className="text-gray-700">{room.address}</p>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tiện nghi</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {room.rules && room.rules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nội quy</h3>
                <ul className="space-y-2">
                  {room.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-500">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Landlord & Action */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>

              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{landlord.full_name}</p>
                  <p className="text-xs text-gray-500">Chủ nhà</p>
                </div>
              </div>

              <a
                href={`tel:${landlord.phone}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mb-3 font-medium"
              >
                <PhoneIcon className="h-5 w-5" />
                Gọi liên hệ
              </a>

              <a
                href={`mailto:${landlord.email}`}
                className="flex items-center gap-3 w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors mb-3 font-medium"
              >
                <EnvelopeIcon className="h-5 w-5" />
                Gửi email
              </a>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                    isFavorite
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <HeartIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-sm">Lưu</span>
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <ShareIcon className="h-5 w-5" />
                  <span className="text-sm">Chia sẻ</span>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => openReportModal('post')}
                  className="w-full rounded-lg border border-red-200 bg-red-50/40 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Báo cáo tin đăng
                </button>
                <button
                  onClick={() => openReportModal('user')}
                  className="w-full rounded-lg border border-orange-200 bg-orange-50/40 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  Báo cáo chủ nhà
                </button>
              </div>
            </div>

            {/* Posted Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <CalendarIcon className="h-5 w-5" />
                Đăng ngày {formatDate(post.createdAt)}
              </div>
              <p className="text-xs text-gray-500">
                ID: {post._id}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        target={reportTarget}
        onClose={closeReportModal}
      />
    </div>
  );
}
