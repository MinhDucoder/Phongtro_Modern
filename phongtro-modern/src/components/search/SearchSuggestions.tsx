'use client';

import { useState, useEffect } from 'react';
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
}

interface SearchSuggestionsProps {
  keyword: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchSuggestions({ keyword, isOpen, onClose }: SearchSuggestionsProps) {
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
    // Chỉ hiển thị suggestions khi có keyword
    if (!isOpen || !keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        
        // Tìm kiếm theo keyword
        const params = new URLSearchParams();
        params.set('q', keyword.trim());
        params.set('limit', '5'); // Hiển thị 5 kết quả
        
        const response = await fetch(`http://localhost:5000/api/v1/posts?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          const items = data.data?.items || [];
          
          // Map dữ liệu từ Post -> Room
          const rooms = items.map((post: any) => ({
            _id: post._id || post.roomId?._id || post.id,
            title: post.title || post.roomId?.title,
            price: post.price || post.roomId?.price,
            area: post.area || post.roomId?.area,
            city: post.location?.city || post.roomId?.city,
            images: post.images || post.roomId?.images || []
          }));
          
          setSuggestions(rooms.filter((room: any) => room._id && room.title));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Real-time debounce - fetch sau 200ms
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [keyword, isOpen]);

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
            <Link
              key={room._id}
              href={`/room/${room._id}`}
              className="p-3 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer"
              onClick={onClose}
            >
              {/* Room Image */}
              <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded-md overflow-hidden">
                {getFirstImageUrl(room.images) ? (
                  <Image
                    src={getFirstImageUrl(room.images)!}
                    alt={room.title}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Room Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {room.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="h-3 w-3" />
                    <span className="font-semibold text-red-600">
                      {(room.price / 1000000).toFixed(1)}tr
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span>{room.area}m²</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    <span className="truncate">{room.city}</span>
                  </div>
                </div>
              </div>
            </Link>
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
