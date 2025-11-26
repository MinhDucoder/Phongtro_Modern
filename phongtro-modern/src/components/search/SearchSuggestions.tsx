'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface Room {
  _id: string;
  title: string;
  price: number;
  area: number;
  city: string;
  images: any[];
  location?: {
    city?: string;
    district?: string;
    address?: string;
  };
}

interface SearchSuggestionsProps {
  keyword: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion?: (keyword: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function SearchSuggestions({ keyword, isOpen, onClose, onSelectSuggestion }: SearchSuggestionsProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to get first image URL safely
  const getFirstImageUrl = (images: any[]): string | null => {
    if (!images || images.length === 0) return null;
    
    const firstImage = images[0];
    
    // If it's a string URL
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage;
    }
    
    // If it's an object with url property
    if (firstImage?.url && typeof firstImage.url === 'string' && firstImage.url.trim()) {
      return firstImage.url;
    }
    
    return null;
  };

  useEffect(() => {
    // Chỉ hiển thị suggestions khi có keyword và isOpen
    if (!isOpen || !keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        
        // Đơn giản: Gọi API posts với keyword để lấy 5 phòng gần nhất
        const params = new URLSearchParams();
        params.set('q', keyword.trim());
        params.set('limit', '5'); // Lấy 5 phòng gần nhất
        
        const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
        const data = await response.json();
        
        if (data.success && data.data?.items) {
          const items = data.data.items;
          
          // Map dữ liệu từ Post -> Room
          const rooms = items.map((post: any) => ({
            _id: post._id || post.roomId?._id || post.id,
            title: post.title || post.roomId?.title || '',
            price: post.price || post.roomId?.price || 0,
            area: post.area || post.roomId?.area || 0,
            city: post.location?.city || post.roomId?.city || '',
            location: post.location || { city: post.roomId?.city, address: post.roomId?.address },
            images: post.images || post.roomId?.images || []
          }));
          
          setSuggestions(rooms.filter((room: any) => room._id && room.title));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Real-time debounce - fetch sau 200ms để giảm số lần gọi API
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [keyword, isOpen]);

  // Xử lý khi click vào suggestion - chuyển đến trang tìm kiếm
  const handleSuggestionClick = (room: Room) => {
    // Tạo keyword từ title hoặc location để search
    const searchKeyword = room.title || 
      (room.location?.address ? room.location.address : 
      (room.location?.district ? room.location.district : 
      (room.city || '')));
    
    if (onSelectSuggestion) {
      onSelectSuggestion(searchKeyword);
    } else {
      // Chuyển đến trang tìm kiếm với keyword
      router.push(`/tim-kiem?keyword=${encodeURIComponent(searchKeyword)}`);
    }
    onClose();
  };

  if (!isOpen || !keyword.trim()) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-full max-h-96 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {suggestions.map((room) => (
            <div
              key={room._id}
              onClick={() => handleSuggestionClick(room)}
              className="p-3 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer"
            >
              {/* Room Image */}
              <div className="flex-shrink-0 w-24 h-20 bg-gray-200 rounded-lg overflow-hidden">
                {getFirstImageUrl(room.images) ? (
                  <Image
                    src={getFirstImageUrl(room.images)!}
                    alt={room.title}
                    width={96}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Room Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5">
                  {room.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="h-3.5 w-3.5 text-red-500" />
                    <span className="font-semibold text-red-600">
                      {(room.price / 1000000).toFixed(1)}tr/tháng
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>{room.area}m²</span>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{room.city}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500">
          Không tìm thấy kết quả phù hợp
        </div>
      )}
    </div>
  );
}
