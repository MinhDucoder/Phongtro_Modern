'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Room } from '@/lib/api';
import { 
  MapPinIcon, 
  HomeIcon, 
  EyeIcon,
  PhoneIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { savedPropertiesApi } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

interface RoomCardProps {
  room: Room;
  onToggleFavorite?: (roomId: string) => void;
  isFavorite?: boolean;
  onToggleSaved?: (roomId: string) => void;
  isSaved?: boolean;
  favoriteId?: string; // ID của favorite record trong database
}

export default function RoomCard({ room, onToggleFavorite, isFavorite = false, onToggleSaved, isSaved = false, favoriteId }: RoomCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (isAvailable: boolean) => {
    return isAvailable ? 'Còn trống' : 'Đã thuê';
  };

  const handleSaveProperty = async () => {
    console.log('🔖 Save Property Debug:', {
      isAuthenticated,
      roomId: room._id,
      isSaved,
      favoriteId
    });

    if (!isAuthenticated) {
      toastManager.showError('Vui lòng đăng nhập để lưu tin', {
        description: 'Bạn cần đăng nhập để sử dụng tính năng này',
        action: {
          label: 'Đăng nhập',
          onClick: () => window.location.href = '/dang-nhap'
        }
      });
      return;
    }

    try {
      setIsSaving(true);
      
      if (isSaved) {
        // Remove from saved
        console.log('🗑️ Removing property from saved...');
        if (favoriteId) {
          await savedPropertiesApi.removeProperty(favoriteId);
        }
        onToggleSaved?.(room._id);
        toastManager.showSuccess('Đã bỏ lưu tin');
      } else {
        // Add to saved
        console.log('💾 Saving property...', { postId: room._id });
        const response = await savedPropertiesApi.saveProperty(room._id);
        console.log('✅ Save response:', response);
        onToggleSaved?.(room._id);
        toastManager.showSuccess('Đã lưu tin thành công');
      }
    } catch (error) {
      console.error('❌ Error saving property:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      toastManager.showError('Có lỗi xảy ra khi lưu tin');
    } finally {
      setIsSaving(false);
    }
  };

  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === "") return false;
    
    // Check for valid URL patterns
    try {
      const urlObj = new URL(trimmed);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      // If not absolute URL, check if it's a relative path
      return trimmed.startsWith('/');
    }
  };

  const getFirstValidImage = (): string | null => {
    if (!room.images || !Array.isArray(room.images)) return null;
    
    for (const img of room.images) {
      // Handle nested array case [[url]] 
      const imageUrl = Array.isArray(img) ? img[0] : img;
      if (isValidImageUrl(imageUrl)) {
        return imageUrl;
      }
    }
    return null;
  };

  const validImageUrl = getFirstValidImage();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full">
        {validImageUrl && !imageError ? (
          <Image
            src={validImageUrl}
            alt={room.title || 'Hình ảnh phòng'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={validImageUrl.includes('unsplash.com')}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <HomeIcon className="h-12 w-12 text-gray-400" />
            <span className="ml-2 text-gray-500 text-sm">Không có ảnh</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.isAvailable)}`}>
            {getStatusLabel(room.isAvailable)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite?.(room._id)}
            className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
            title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveProperty}
            disabled={isSaving}
            className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50"
            title={isSaved ? 'Bỏ lưu tin' : 'Lưu tin'}
          >
            {isSaving ? (
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : isSaved ? (
              <BookmarkSolidIcon className="h-5 w-5 text-blue-500" />
            ) : (
              <BookmarkIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/phong/${room._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
            {room.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(room.price)}
          </span>
          <span className="text-sm text-gray-500 ml-1">/tháng</span>
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">
            {room.address}, {room.city}
          </span>
        </div>

        {/* Room Info */}
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>Phòng trọ</span>
          </div>
          <div className="flex items-center">
            <span>{room.area}m²</span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {room.description}
        </p>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{room.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Đăng {formatDate(room.createdAt)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span>ID: {room._id.slice(-6)}</span>
          </div>
        </div>

        {/* Contact Button */}
        <div className="mt-3">
          <Link
            href={`/phong/${room._id}`}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
