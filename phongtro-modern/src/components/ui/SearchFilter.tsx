'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const provinces = [
  'Tất cả',
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Cần Thơ',
  'Hải Phòng',
  'Khánh Hòa',
];

const categories = [
  { id: 'all', name: 'Tất cả', count: 75839 },
  { id: 'phong-tro', name: 'Phòng trọ', count: 45123 },
  { id: 'nha-nguyen-can', name: 'Nhà nguyên căn', count: 12456 },
  { id: 'can-ho', name: 'Căn hộ chung cư', count: 8932 },
  { id: 'can-ho-mini', name: 'Căn hộ mini', count: 5678 },
  { id: 'o-ghep', name: 'Ở ghép', count: 2134 },
  { id: 'mat-bang', name: 'Mặt bằng', count: 1516 },
];

const priceRanges = [
  'Tất cả mức giá',
  'Dưới 1 triệu',
  '1 - 2 triệu',
  '2 - 3 triệu',
  '3 - 5 triệu',
  '5 - 7 triệu',
  '7 - 10 triệu',
  'Trên 10 triệu',
];

const areaRanges = [
  'Tất cả diện tích',
  'Dưới 20m²',
  '20 - 30m²',
  '30 - 50m²',
  '50 - 70m²',
  '70 - 100m²',
  'Trên 100m²',
];

export default function SearchFilter() {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('Tất cả mức giá');
  const [selectedArea, setSelectedArea] = useState('Tất cả diện tích');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Build search params
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('q', searchKeyword.trim());
    if (selectedProvince !== 'Tất cả') params.set('province', selectedProvince);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedPrice !== 'Tất cả mức giá') params.set('price', selectedPrice);
    if (selectedArea !== 'Tất cả diện tích') params.set('area', selectedArea);
    
    // Navigate to search results
    const searchUrl = `/tim-kiem?${params.toString()}`;
    router.push(searchUrl);
    
    // Reset loading state after navigation
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSelectedProvince('Tất cả');
    setSelectedCategory('all');
    setSelectedPrice('Tất cả mức giá');
    setSelectedArea('Tất cả diện tích');
    setSearchKeyword('');
  };

  const hasActiveFilters = selectedProvince !== 'Tất cả' || 
                          selectedCategory !== 'all' || 
                          selectedPrice !== 'Tất cả mức giá' || 
                          selectedArea !== 'Tất cả diện tích' ||
                          searchKeyword.trim() !== '';

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main search bar */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo từ khóa, địa chỉ..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Province selector */}
            <div className="lg:w-48">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center min-w-[120px]"
            >
              {isSearching ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tìm...
                </div>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </>
              )}
            </button>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 border rounded-lg transition-colors flex items-center ${
                showAdvancedFilters || hasActiveFilters
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50 text-blue-800'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Bộ lọc</span>
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {[selectedProvince !== 'Tất cả', selectedCategory !== 'all', selectedPrice !== 'Tất cả mức giá', selectedArea !== 'Tất cả diện tích', searchKeyword.trim() !== ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-dark hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                {category.name} 
                <span className="ml-2 text-xs text-gray-600">
                  ({mounted ? category.count.toLocaleString() : category.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2" />
                Bộ lọc nâng cao
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Xóa tất cả
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  Mức giá
                </label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <HomeIcon className="w-4 h-4 mr-1" />
                  Diện tích
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {areaRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <select className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option>Tin mới nhất</option>
                  <option>Giá thấp đến cao</option>
                  <option>Giá cao đến thấp</option>
                  <option>Diện tích nhỏ đến lớn</option>
                  <option>Diện tích lớn đến nhỏ</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
