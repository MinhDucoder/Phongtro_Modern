'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Mock map data - trong thực tế sẽ tích hợp với Google Maps API
const mockMapProperties = [
  {
    id: '1',
    title: 'Phòng trọ gần ĐH Bách Khoa',
    price: '3.5 triệu/tháng',
    area: '25 m²',
    location: 'Hai Bà Trưng, Hà Nội',
    image: '/placeholder-room.svg',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    views: 234,
    likes: 12,
    isFeatured: true,
  },
  {
    id: '2', 
    title: 'Căn hộ mini có ban công',
    price: '4.2 triệu/tháng',
    area: '35 m²',
    location: 'Thanh Xuân, Hà Nội',
    image: '/placeholder-room.svg',
    coordinates: { lat: 20.9967, lng: 105.8019 },
    views: 189,
    likes: 8,
    isFeatured: false,
  },
  {
    id: '3',
    title: 'Phòng trọ giá rẻ gần chợ',
    price: '2.8 triệu/tháng', 
    area: '20 m²',
    location: 'Đống Đa, Hà Nội',
    image: '/placeholder-room.svg',
    coordinates: { lat: 21.0245, lng: 105.8412 },
    views: 156,
    likes: 5,
    isFeatured: false,
  },
  {
    id: '4',
    title: 'Studio apartment modern',
    price: '6.5 triệu/tháng',
    area: '40 m²', 
    location: 'Cầu Giấy, Hà Nội',
    image: '/placeholder-room.svg',
    coordinates: { lat: 21.0333, lng: 105.7969 },
    views: 298,
    likes: 18,
    isFeatured: true,
  },
];

interface SearchMapProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchMap({ searchParams }: SearchMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<typeof mockMapProperties[0] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite'>('roadmap');

  // Filter properties based on search params
  const filteredProperties = mockMapProperties.filter(property => {
    if (searchParams.keyword) {
      const keyword = searchParams.keyword as string;
      return property.title.toLowerCase().includes(keyword.toLowerCase()) ||
             property.location.toLowerCase().includes(keyword.toLowerCase());
    }
    return true;
  });

  const handlePropertyClick = (property: typeof mockMapProperties[0]) => {
    setSelectedProperty(property);
    setZoomLevel(15);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 8));
  };

  const handleResetView = () => {
    setZoomLevel(12);
    setSelectedProperty(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Bản đồ</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Bộ lọc bản đồ"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetView}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Map Filters */}
        {showFilters && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kiểu bản đồ
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMapStyle('roadmap')}
                    className={`px-3 py-1 text-sm rounded ${
                      mapStyle === 'roadmap' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border'
                    }`}
                  >
                    Đường phố
                  </button>
                  <button
                    onClick={() => setMapStyle('satellite')}
                    className={`px-3 py-1 text-sm rounded ${
                      mapStyle === 'satellite' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border'
                    }`}
                  >
                    Vệ tinh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 text-sm text-gray-600">
          Hiển thị <span className="font-medium">{filteredProperties.length}</span> tin đăng trên bản đồ
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-100">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
          <div className="absolute inset-0 bg-gray-200 opacity-20">
            {/* Grid pattern to simulate map */}
            <div className="w-full h-full" 
                 style={{
                   backgroundImage: `
                     linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                   `,
                   backgroundSize: '20px 20px'
                 }}>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white shadow-md rounded flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white shadow-md rounded flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            −
          </button>
        </div>

        {/* Property Markers */}
        {filteredProperties.map((property, index) => (
          <div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${30 + (index * 12)}%`,
            }}
            onClick={() => handlePropertyClick(property)}
          >
            {/* Marker */}
            <div className={`relative ${
              selectedProperty?.id === property.id ? 'z-20' : 'z-10'
            }`}>
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-medium ${
                property.isFeatured ? 'bg-red-500' : 'bg-blue-500'
              } ${selectedProperty?.id === property.id ? 'scale-125' : ''} transition-transform`}>
                {parseFloat(property.price).toFixed(0)[0]}
              </div>
              
              {/* Price Label */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-white shadow-md rounded text-xs font-medium whitespace-nowrap">
                {property.price}
              </div>
            </div>
          </div>
        ))}

        {/* Property Popup */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border z-30">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 line-clamp-2 pr-2">
                  {selectedProperty.title}
                </h4>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Image
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  width={64}
                  height={48}
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-green-600">
                      {selectedProperty.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedProperty.area}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedProperty.location}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {selectedProperty.views}
                    </div>
                    <div className="flex items-center">
                      <HeartIcon className="h-4 w-4 mr-1" />
                      {selectedProperty.likes}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <a
                  href={`/phong-tro/${selectedProperty.id}`}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded text-center hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </a>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                  Lưu tin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Loading State */}
        {filteredProperties.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Không có tin đăng nào để hiển thị trên bản đồ</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Tin thường</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Tin nổi bật</span>
            </div>
          </div>
          <div className="text-gray-500">
            Zoom: {zoomLevel}x
          </div>
        </div>
      </div>

      {/* Integration Notice */}
      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <strong>Lưu ý:</strong> Đây là bản đồ mô phỏng. Trong thực tế sẽ tích hợp Google Maps API 
          để hiển thị vị trí chính xác và tính năng định vị.
        </p>
      </div>
    </div>
  );
}
