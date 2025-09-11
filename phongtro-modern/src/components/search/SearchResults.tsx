'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PropertyCard from '@/components/ui/PropertyCard';
import Pagination from '@/components/ui/Pagination';
import {
  FunnelIcon,
  ListBulletIcon,
  Squares2X2Icon,
  MapIcon,
  EyeIcon,
  HeartIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Mock data với nhiều properties hơn để test pagination
const generateMockProperties = (count: number) => {
  const locations = [
    'Hai Bà Trưng, Hà Nội',
    'Bình Thạnh, Hồ Chí Minh', 
    'Thanh Xuân, Hà Nội',
    'Quận 1, Hồ Chí Minh',
    'Đống Đa, Hà Nội',
    'Quận 3, Hồ Chí Minh',
    'Cầu Giấy, Hà Nội',
    'Quận 7, Hồ Chí Minh'
  ];
  
  const titles = [
    'Phòng trọ gần trường đại học, đầy đủ nội thất',
    'Căn hộ mini có ban công, view đẹp',
    'Nhà nguyên căn 2 phòng ngủ, có sân vườn',
    'Phòng trọ cao cấp, an ninh tốt',
    'Căn hộ dịch vụ đầy đủ tiện nghi',
    'Phòng ở ghép, giá rẻ, gần chợ',
    'Mặt bằng kinh doanh, vị trí đẹp',
    'Studio apartment, modern design'
  ];

  const contacts = [
    { name: 'Anh Minh', phone: '0987654321' },
    { name: 'Chị Hoa', phone: '0912345678' },
    { name: 'Anh Nam', phone: '0934567890' },
    { name: 'Chị Lan', phone: '0945678901' },
    { name: 'Anh Đức', phone: '0967890123' },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    title: `${titles[i % titles.length]} ${i + 1}`,
    price: `${(Math.random() * 5 + 2).toFixed(1)} triệu/tháng`,
    area: `${Math.floor(Math.random() * 40 + 15)} m²`,
    location: locations[i % locations.length],
    images: ['/placeholder-room.svg'],
    description: `Mô tả chi tiết cho property ${i + 1}. Phòng trọ đầy đủ tiện nghi, vị trí thuận lợi, giá cả hợp lý.`,
    contact: contacts[i % contacts.length],
    postedTime: ['Hôm nay', '1 giờ trước', '2 giờ trước', 'Hôm qua', '2 ngày trước'][i % 5],
    isFeatured: Math.random() > 0.7,
    views: Math.floor(Math.random() * 500 + 50),
    likes: Math.floor(Math.random() * 50 + 5),
    calls: Math.floor(Math.random() * 20 + 1),
  }));
};

interface SearchResultsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchResults({ searchParams }: SearchResultsProps) {
  const [allProperties] = useState(generateMockProperties(48)); // Generate 48 properties for pagination
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  
  // Filter properties based on search params (simplified for demo)
  const filteredProperties = allProperties.filter(property => {
    if (searchParams.keyword) {
      const keyword = searchParams.keyword as string;
      return property.title.toLowerCase().includes(keyword.toLowerCase()) ||
             property.location.toLowerCase().includes(keyword.toLowerCase());
    }
    if (searchParams.province) {
      const province = searchParams.province as string;
      return property.location.includes(province);
    }
    return true;
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProperties.length / limit);

  // Stats
  const totalViews = filteredProperties.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = filteredProperties.reduce((sum, p) => sum + p.likes, 0);
  const avgPrice = filteredProperties.reduce((sum, p) => sum + parseFloat(p.price), 0) / filteredProperties.length;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Kết quả tìm kiếm
            </h2>
            <p className="text-sm text-gray-600">
              Tìm thấy <span className="font-medium">{filteredProperties.length}</span> kết quả
              {searchParams.keyword && (
                <span> cho từ khóa &ldquo;<span className="font-medium">{searchParams.keyword}</span>&rdquo;</span>
              )}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={() => setShowMap(!showMap)}
              className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              <MapIcon className="h-4 w-4 mr-1" />
              Bản đồ
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">{filteredProperties.length}</div>
            <div className="text-xs text-blue-600">Tổng tin đăng</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{totalViews.toLocaleString()}</div>
            <div className="text-xs text-green-600">Lượt xem</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-semibold text-red-600">{totalLikes}</div>
            <div className="text-xs text-red-600">Yêu thích</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-semibold text-purple-600">{avgPrice.toFixed(1)}tr</div>
            <div className="text-xs text-purple-600">Giá TB</div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(searchParams).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Bộ lọc đang áp dụng:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(searchParams).map(([key, value]) => {
              if (!value || key === 'page') return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {key === 'keyword' && 'Từ khóa: '}
                  {key === 'province' && 'Tỉnh: '}
                  {key === 'propertyType' && 'Loại: '}
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {paginatedProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FunnelIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-500 mb-6">
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc
          </p>
          <Link
            href="/tim-kiem"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Tìm kiếm mới
          </Link>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {paginatedProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={128}
                      height={96}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/phong-tro/${property.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {property.title}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-lg font-bold text-green-600">{property.price}</span>
                            <span className="text-sm text-gray-500">{property.area}</span>
                          </div>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              {property.views}
                            </div>
                            <div className="flex items-center">
                              <HeartIcon className="h-4 w-4 mr-1" />
                              {property.likes}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {property.postedTime}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-2">{property.contact.name}</p>
                          <Link
                            href={`tel:${property.contact.phone}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            Gọi
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/tim-kiem"
            />
          )}
        </>
      )}

      {/* Load More for Mobile */}
      <div className="md:hidden text-center">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Xem thêm kết quả
        </button>
      </div>

      {/* Search Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Mẹo tìm kiếm hiệu quả</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sử dụng từ khóa cụ thể như &ldquo;gần trường đại học&rdquo;, &ldquo;có ban công&rdquo;</li>
          <li>• Kết hợp nhiều bộ lọc để thu hẹp kết quả</li>
          <li>• Lưu tìm kiếm để nhận thông báo tin mới</li>
          <li>• Xem trên bản đồ để chọn vị trí phù hợp</li>
        </ul>
      </div>
    </div>
  );
}
