'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  Square2StackIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const propertyTypes = [
  { value: '', label: 'Tất cả loại hình' },
  { value: 'phong-tro', label: 'Phòng trọ' },
  { value: 'nha-nguyen-can', label: 'Nhà nguyên căn' },
  { value: 'can-ho', label: 'Căn hộ chung cư' },
  { value: 'can-ho-mini', label: 'Căn hộ mini' },
  { value: 'can-ho-dich-vu', label: 'Căn hộ dịch vụ' },
  { value: 'o-ghep', label: 'Ở ghép' },
  { value: 'mat-bang', label: 'Mặt bằng' },
];

const provinces = [
  'Tất cả tỉnh thành',
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
];

const priceRanges = [
  { value: '', label: 'Tất cả mức giá', min: 0, max: 0 },
  { value: '0-1', label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { value: '1-2', label: '1 - 2 triệu', min: 1000000, max: 2000000 },
  { value: '2-3', label: '2 - 3 triệu', min: 2000000, max: 3000000 },
  { value: '3-5', label: '3 - 5 triệu', min: 3000000, max: 5000000 },
  { value: '5-7', label: '5 - 7 triệu', min: 5000000, max: 7000000 },
  { value: '7-10', label: '7 - 10 triệu', min: 7000000, max: 10000000 },
  { value: '10+', label: 'Trên 10 triệu', min: 10000000, max: 0 },
];

const areaRanges = [
  { value: '', label: 'Tất cả diện tích', min: 0, max: 0 },
  { value: '0-20', label: 'Dưới 20m²', min: 0, max: 20 },
  { value: '20-30', label: '20 - 30m²', min: 20, max: 30 },
  { value: '30-50', label: '30 - 50m²', min: 30, max: 50 },
  { value: '50-70', label: '50 - 70m²', min: 50, max: 70 },
  { value: '70-100', label: '70 - 100m²', min: 70, max: 100 },
  { value: '100+', label: 'Trên 100m²', min: 100, max: 0 },
];

const amenities = [
  { value: 'dieu-hoa', label: 'Điều hòa', icon: '❄️' },
  { value: 'nong-lanh', label: 'Nóng lạnh', icon: '🚿' },
  { value: 'tu-lanh', label: 'Tủ lạnh', icon: '🧊' },
  { value: 'may-giat', label: 'Máy giặt', icon: '👕' },
  { value: 'wifi', label: 'WiFi miễn phí', icon: '📶' },
  { value: 'cho-de-xe', label: 'Chỗ để xe', icon: '🏍️' },
  { value: 'ban-cong', label: 'Ban công', icon: '🪟' },
  { value: 'wc-rieng', label: 'WC riêng', icon: '🚽' },
  { value: 'bep-gas', label: 'Bếp gas', icon: '🔥' },
  { value: 'camera', label: 'Camera an ninh', icon: '📹' },
  { value: 'thang-may', label: 'Thang máy', icon: '🛗' },
  { value: 'bao-ve', label: 'Bảo vệ 24/7', icon: '🛡️' },
];

const sortOptions = [
  { value: 'newest', label: 'Tin mới nhất' },
  { value: 'price_low', label: 'Giá thấp đến cao' },
  { value: 'price_high', label: 'Giá cao đến thấp' },
  { value: 'area_small', label: 'Diện tích nhỏ đến lớn' },
  { value: 'area_large', label: 'Diện tích lớn đến nhỏ' },
  { value: 'most_viewed', label: 'Xem nhiều nhất' },
  { value: 'most_liked', label: 'Yêu thích nhiều nhất' },
];

interface AdvancedSearchProps {
  initialParams: { [key: string]: string | string[] | undefined };
}

export default function AdvancedSearch({ initialParams }: AdvancedSearchProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<Record<string, string | number | boolean | string[]>>({
    keyword: (initialParams.keyword as string) || '',
    propertyType: (initialParams.propertyType as string) || '',
    province: (initialParams.province as string) || '',
    district: (initialParams.district as string) || '',
    priceRange: (initialParams.priceRange as string) || '',
    areaRange: (initialParams.areaRange as string) || '',
    amenities: (initialParams.amenities as string)?.split(',').filter(Boolean) || [],
    sortBy: (initialParams.sortBy as string) || 'newest',
    minPrice: (initialParams.minPrice as string) || '',
    maxPrice: (initialParams.maxPrice as string) || '',
    minArea: (initialParams.minArea as string) || '',
    maxArea: (initialParams.maxArea as string) || '',
    postedWithin: (initialParams.postedWithin as string) || '',
    hasImages: (initialParams.hasImages as string) === 'true',
    verifiedOwner: (initialParams.verifiedOwner as string) === 'true',
  });

  useEffect(() => {
    // Load saved searches from localStorage
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: (prev.amenities as string[]).includes(amenity)
        ? (prev.amenities as string[]).filter(a => a !== amenity)
        : [...(prev.amenities as string[]), amenity]
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });

    router.push(`/tim-kiem?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      propertyType: '',
      province: '',
      district: '',
      priceRange: '',
      areaRange: '',
      amenities: [],
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      postedWithin: '',
      hasImages: false,
      verifiedOwner: false,
    });
    router.push('/tim-kiem');
  };

  const handleSaveSearch = () => {
    const searchName = prompt('Đặt tên cho tìm kiếm này:');
    if (searchName) {
      const searchQuery = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && value !== false && value !== 0) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              searchQuery.set(key, value.join(','));
            }
          } else {
            searchQuery.set(key, value.toString());
          }
        }
      });
      
      const newSaved = [...savedSearches, `${searchName}|${searchQuery.toString()}`];
      setSavedSearches(newSaved);
      localStorage.setItem('savedSearches', JSON.stringify(newSaved));
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '' && value !== false && value !== 0;
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Basic Search */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo từ khóa, địa chỉ..."
                value={filters.keyword as string}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <select
              value={filters.propertyType as string}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Province */}
          <div>
            <select
              value={filters.province as string}
              onChange={(e) => handleFilterChange('province', e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {provinces.map(province => (
                <option key={province} value={province === 'Tất cả tỉnh thành' ? '' : province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Bộ lọc nâng cao
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveSearch}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookmarkIcon className="h-5 w-5 mr-2" />
              Lưu tìm kiếm
            </button>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-6 bg-gray-50 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Mức giá
              </label>
              <select
                value={filters.priceRange as string}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              
              {/* Custom Price Range */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Giá từ"
                  value={filters.minPrice as string}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Giá đến"
                  value={filters.maxPrice as string}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Area Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Square2StackIcon className="h-4 w-4 inline mr-1" />
                Diện tích
              </label>
              <select
                value={filters.areaRange as string}
                onChange={(e) => handleFilterChange('areaRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {areaRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              
              {/* Custom Area Range */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="DT từ (m²)"
                  value={filters.minArea as string}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="DT đến (m²)"
                  value={filters.maxArea as string}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Posted Within */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                Thời gian đăng
              </label>
              <select
                value={filters.postedWithin as string}
                onChange={(e) => handleFilterChange('postedWithin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả thời gian</option>
                <option value="1">Trong 24 giờ</option>
                <option value="3">Trong 3 ngày</option>
                <option value="7">Trong tuần</option>
                <option value="30">Trong tháng</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={filters.sortBy as string}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Additional Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tùy chọn khác
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasImages as boolean}
                    onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Có hình ảnh</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOwner as boolean}
                    onChange={(e) => handleFilterChange('verifiedOwner', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Chủ nhà đã xác thực</span>
                </label>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tiện nghi
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenities.map(amenity => (
                <label key={amenity.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.amenities as string[]).includes(amenity.value)}
                    onChange={() => handleAmenityToggle(amenity.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {amenity.icon} {amenity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="p-4 bg-blue-50 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm đã lưu:</h4>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((saved, index) => {
              const [name] = saved.split('|');
              return (
                <button
                  key={index}
                  onClick={() => {
                    const [, query] = saved.split('|');
                    router.push(`/tim-kiem?${query}`);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
