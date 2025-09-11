'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon,
  EyeIcon,
  ShareIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  area: string;
  location: string;
  images: string[];
  description: string;
  contact: {
    name: string;
    phone: string;
    isVerified?: boolean;
  };
  postedTime: string;
  isFeatured?: boolean;
  viewCount?: number;
  rating?: number;
  amenities?: string[];
}

export default function PropertyCard({
  id,
  title,
  price,
  area,
  location,
  images,
  description,
  contact,
  postedTime,
  isFeatured = false,
  viewCount = 0,
  rating = 0,
  amenities = [],
}: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.origin + `/phong-tro/${id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/phong-tro/${id}`);
      toast.success('Đã copy link vào clipboard');
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group ${
      isFeatured ? 'ring-2 ring-yellow-400 shadow-lg' : ''
    }`}>
      {/* Image carousel */}
      <div className="relative h-48 group/image">
        <Link href={`/phong-tro/${id}`}>
          <Image
            src={images[currentImageIndex] || '/placeholder-room.svg'}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => handleImageNavigation('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleImageNavigation('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image count */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <EyeIcon className="w-3 h-3 mr-1" />
          {images.length}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={handleLike}
            className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <ShareIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-medium px-2 py-1 rounded shadow-md">
            ⭐ Tin nổi bật
          </div>
        )}

        {/* View count */}
        {viewCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
            <EyeIcon className="w-3 h-3 mr-1" />
            {viewCount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/phong-tro/${id}`} className="block">
          <h3 className="font-semibold text-darker line-clamp-2 hover:text-blue-600 transition-colors mb-2">
            {title}
          </h3>
        </Link>

        {/* Price and area */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-green-600">{price}</span>
          <span className="text-sm text-medium bg-gray-100 px-2 py-1 rounded">{area}</span>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-medium ml-2">({rating})</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-sm text-medium mb-3">
          <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{amenities.length - 3} khác
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-medium line-clamp-2 mb-3">
          {description}
        </p>

        {/* Contact and time */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-darker">{contact.name}</span>
              {contact.isVerified && (
                <CheckCircleIcon className="w-4 h-4 text-blue-500 ml-1" />
              )}
            </div>
            <div className="flex items-center text-sm text-light">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{postedTime}</span>
            </div>
          </div>
          
          <Link
            href={`tel:${contact.phone}`}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gọi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
