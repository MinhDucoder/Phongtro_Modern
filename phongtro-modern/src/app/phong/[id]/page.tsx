'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { roomApi, Room } from '@/lib/api';
import { 
  MapPinIcon, 
  HomeIcon, 
  EyeIcon,
  PhoneIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import { toastManager } from '@/components/ui/ToastManager';

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await roomApi.getRoomById(roomId);
      
      if (response.data) {
        setRoom(response.data);
      } else {
        // Mock data nếu API chưa sẵn sàng
        setRoom(getMockRoom());
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      // Fallback to mock data
      setRoom(getMockRoom());
      toast.error('Không thể tải thông tin phòng. Đang hiển thị dữ liệu mẫu.');
    } finally {
      setLoading(false);
    }
  };

  const getMockRoom = (): Room => {
    return {
      _id: roomId,
      title: 'Phòng trọ gần ĐH Bách Khoa Hà Nội',
      description: 'Phòng trọ sạch sẽ, thoáng mát, gần trường đại học. Có đầy đủ tiện nghi cơ bản. Phòng rộng rãi, có cửa sổ lớn, ánh sáng tự nhiên tốt. Khu vực yên tĩnh, an ninh tốt.',
      price: 2500000,
      area: 25,
      address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng',
      city: 'Hà Nội',
      images: ['/placeholder-room.svg', '/placeholder-room.svg', '/placeholder-room.svg'],
      amenities: ['Điều hòa', 'Wifi', 'Nước nóng', 'Tủ lạnh', 'Máy giặt', 'Bếp', 'Tủ quần áo'],
      landlord: 'landlord1',
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoomTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'phong_tro': 'Phòng trọ',
      'nha_nguyen_can': 'Nhà nguyên căn',
      'can_ho_chung_cu': 'Căn hộ chung cư',
      'can_ho_mini': 'Căn hộ mini',
      'o_ghep': 'Ở ghép',
      'mat_bang': 'Mặt bằng'
    };
    return typeLabels[type] || type;
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (isAvailable: boolean) => {
    return isAvailable ? 'Còn trống' : 'Đã thuê';
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toastManager.showSuccess(isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: room?.title,
        text: room?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toastManager.showSuccess('Đã copy link vào clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy phòng</h3>
            <p className="mt-1 text-sm text-gray-500">
              Phòng bạn đang tìm có thể đã bị xóa hoặc không tồn tại.
            </p>
            <div className="mt-6">
              <Link
                href="/phong"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/phong"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative h-96">
                {room.images && room.images.length > 0 ? (
                  <Image
                    src={typeof room.images[currentImageIndex] === 'string' 
                      ? room.images[currentImageIndex] 
                      : '/placeholder-room.svg'}
                    alt={room.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <HomeIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Image Navigation */}
                {room.images && room.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.isAvailable)}`}>
                    {getStatusLabel(room.isAvailable)}
                  </span>
                </div>

                {/* Featured Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Nổi bật
                  </span>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ShareIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{room.address}, {room.city}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4 mr-1" />
                  <span>Phòng trọ</span>
                </div>
                <div className="flex items-center">
                  <span>{room.area}m²</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{room.description}</p>
            </div>

            {/* Utilities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiện ích</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(room.price)}
                </div>
                <div className="text-sm text-gray-500">/tháng</div>
              </div>

              <div className="space-y-3 mb-6">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  <PhoneIcon className="h-5 w-5 inline mr-2" />
                  Gọi ngay: 0987654321
                </button>
                <button className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-md hover:bg-blue-50 transition-colors font-medium">
                  Nhắn tin
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin liên hệ</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Tên:</strong> Chủ nhà</p>
                  <p><strong>SĐT:</strong> 0987654321</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đăng:</span>
                  <span className="text-gray-900">{formatDate(room.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="text-gray-900">{formatDate(room.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
