'use client';

import { useState, useEffect } from 'react';
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
import toast from 'react-hot-toast';
import { savedPropertiesApi } from '@/lib/api';

// Mock data removed - using real API data only

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

export default function SavedProperties() {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
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
        setSavedProperties(response.data.properties);
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
      toast.error('Không thể tải danh sách tin đã lưu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort properties
  const filteredAndSortedProperties = savedProperties
    .filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchQuery.toLowerCase());
      
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
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'views':
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const handleRemoveFromSaved = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin này khỏi danh sách yêu thích?')) return;
    
    setIsLoading(true);
    try {
      const response = await savedPropertiesApi.removeProperty(id);
      
      if (response.success) {
        setSavedProperties(prev => prev.filter(p => p.id !== id));
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        toast.error(response.message || 'Không thể xóa khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('Error removing property:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactCall = (phone: string) => {
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
                    {property.image && property.image.trim() !== '' ? (
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
                          href={`/phong-tro/${property.id}`}
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
                              {property.price}
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
                            <span>Lưu: {new Date(property.savedDate || property.savedAt || '').toLocaleDateString('vi-VN')}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{property.contact.name}</span>
                            <button
                              onClick={() => handleContactCall(property.contact.phone)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
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
