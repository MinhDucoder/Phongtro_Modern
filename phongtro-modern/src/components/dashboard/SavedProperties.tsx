'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HeartIcon,
  EyeIcon,
  PhoneIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toastManager } from '@/components/ui/ToastManager';
import { savedPropertiesApi } from '@/lib/api';

const filterOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'available', label: 'Còn trống' },
  { value: 'unavailable', label: 'Đã cho thuê' },
  { value: 'featured', label: 'Tin nổi bật' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới lưu nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'price_low', label: 'Giá thấp đến cao' },
  { value: 'price_high', label: 'Giá cao đến thấp' },
  { value: 'views', label: 'Lượt xem nhiều nhất' },
];

interface SavedPropertyContact {
  name: string;
  phone: string;
  email?: string;
}

interface SavedProperty {
  id: string;
  postId?: string;
  title: string;
  description?: string;
  price: number;
  formattedPrice: string;
  area: string;
  address: string;
  location: string;
  image: string;
  images: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  savedDate: string;
  views: number;
  contact: SavedPropertyContact;
}

const featuredLevels = ['vip', 'vip1', 'vip2', 'vip3', 'vip 1', 'vip 2', 'vip 3', 'platinum'];

const normalizeImage = (image: any): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (typeof image === 'object' && typeof image.url === 'string') return image.url;
  return '';
};

const normalizeImages = (images: any): string[] => {
  if (!Array.isArray(images)) return [];
  return images
    .map(normalizeImage)
    .filter((value): value is string => Boolean(value && typeof value === 'string')); // Filter out empty
};

const mapSavedProperty = (property: any): SavedProperty => {
  const room = property.post?.roomId || property.room || {};

  const priceValue = typeof property.price === 'number'
    ? property.price
    : parseFloat(property.price) || room.price || 0;

  const formattedPrice = priceValue > 0
    ? `${priceValue.toLocaleString()} VNĐ/tháng`
    : 'Giá liên hệ';

  const images = normalizeImages(
    Array.isArray(property.images) && property.images.length > 0 ? property.images : room.images
  );

  const favoriteLevel = (property.post?.favouriteLevel || '').toLowerCase();

  const primaryImage = normalizeImage(property.image) || images[0] || normalizeImage(room.coverImage);

  return {
    id: property.id || property._id,
    postId: property.postId || property.post?._id || room?._id,
    title: property.title || room.title || 'Tin đăng',
    description: property.description || room.description,
    price: priceValue,
    formattedPrice,
    area: property.area || (room.area ? `${room.area} m²` : '—'),
    address: property.address || room.address || '',
    location: property.location || room.city || '',
    image: primaryImage || '/placeholder-room.svg',
    images,
    isAvailable: property.isAvailable ?? property.post?.status === 'active',
    isFeatured: property.isFeatured ?? featuredLevels.includes(favoriteLevel),
    savedDate: property.savedDate || property.savedAt || new Date().toISOString(),
    views: property.views || property.post?.views || room.views || 0,
    contact: {
      name: property.contact?.name || property.post?.landlord?.full_name || 'Chủ nhà',
      phone: property.contact?.phone || property.post?.landlord?.phone || '',
      email: property.contact?.email || property.post?.landlord?.email,
    },
  };
};

export default function SavedProperties() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSavedProperties();
  }, [searchQuery, selectedFilter, sortBy, pagination.page]);

  const fetchSavedProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await savedPropertiesApi.getSavedProperties({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        filter: selectedFilter === 'all' ? undefined : selectedFilter,
        sortBy
      });

      if (response.success && response.data) {
        const normalized = (response.data.properties || []).map(mapSavedProperty);
        setSavedProperties(normalized);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        setError(response.message || 'Không thể tải danh sách tin đã lưu');
        setSavedProperties([]);
      }
    } catch (error: any) {
      console.error('Error fetching saved properties:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setSavedProperties([]);
      toastManager.showError('Không thể tải danh sách tin đã lưu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return savedProperties
      .filter(property => {
        const matchesSearch = !normalizedSearch
          || property.title.toLowerCase().includes(normalizedSearch)
          || property.location.toLowerCase().includes(normalizedSearch)
          || property.address.toLowerCase().includes(normalizedSearch);

        let matchesFilter = true;
        switch (selectedFilter) {
          case 'available':
            matchesFilter = property.isAvailable;
            break;
          case 'unavailable':
            matchesFilter = !property.isAvailable;
            break;
          case 'featured':
            matchesFilter = property.isFeatured;
            break;
        }

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
          case 'oldest':
            return new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime();
          case 'price_low':
            return (a.price || 0) - (b.price || 0);
          case 'price_high':
            return (b.price || 0) - (a.price || 0);
          case 'views':
            return (b.views || 0) - (a.views || 0);
          default:
            return 0;
        }
      });
  }, [savedProperties, searchQuery, selectedFilter, sortBy]);

  const handleRemoveFromSaved = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin này khỏi danh sách yêu thích?')) return;
    
    setIsLoading(true);
    try {
      const response = await savedPropertiesApi.removeProperty(id);
      
      if (response.success) {
        setSavedProperties(prev => prev.filter(p => p.id !== id));
        toastManager.showSuccess('Đã xóa khỏi danh sách yêu thích');
      } else {
        toastManager.showError(response.message || 'Không thể xóa khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('Error removing property:', error);
      toastManager.showError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactCall = (phone?: string) => {
    if (!phone) {
      toastManager.showError('Không có số điện thoại liên hệ');
      return;
    }

    window.open(`tel:${phone}`, '_self');
  };

  if (error && savedProperties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchSavedProperties()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin đã lưu</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bạn đã lưu {savedProperties.length} tin đăng
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-500">
          Hiển thị {filteredAndSortedProperties.length} kết quả
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tin đã lưu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="sm:w-48">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {filteredAndSortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery || selectedFilter !== 'all' ? 'Không tìm thấy kết quả' : 'Chưa có tin đăng nào được lưu'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Hãy lưu những tin đăng bạn quan tâm để xem sau'
              }
            </p>
            {!searchQuery && selectedFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/phong-tro"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Tìm phòng trọ
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedProperties.map((property) => (
              <div key={property.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0 relative">
                    {typeof property.image === 'string' && property.image.trim() !== '' ? (
                      <Image
                        src={property.image}
                        alt={property.title || 'Property image'}
                        width={120}
                        height={90}
                        className="w-30 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-30 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {property.isFeatured && (
                      <div className="absolute top-1 left-1 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                        Nổi bật
                      </div>
                    )}
                    {!property.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-white text-xs font-medium">Đã thuê</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          href={`/phong-tro/${property.postId || property.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {property.title}
                        </Link>
                        
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">{property.address}, {property.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-green-600">
                              {property.formattedPrice}
                            </span>
                            <span className="text-sm text-gray-500">
                              {property.area}
                            </span>
                          </div>
                        </div>

                        {/* Stats and Contact */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              {property.views} lượt xem
                            </div>
                            <span>Lưu: {new Date(property.savedDate).toLocaleDateString('vi-VN')}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{property.contact.name}</span>
                            <button
                              onClick={() => handleContactCall(property.contact.phone)}
                              disabled={!property.contact.phone}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              Gọi
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleRemoveFromSaved(property.id)}
                          disabled={isLoading}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa khỏi danh sách yêu thích"
                        >
                          <HeartSolidIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng đã lưu</p>
              <p className="text-lg font-semibold text-gray-900">{savedProperties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FunnelIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Còn trống</p>
              <p className="text-lg font-semibold text-gray-900">
                {savedProperties.filter(p => p.isAvailable).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tin nổi bật</p>
              <p className="text-lg font-semibold text-gray-900">
                {savedProperties.filter(p => p.isFeatured).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
