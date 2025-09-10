'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

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
  const [selectedProvince, setSelectedProvince] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('Tất cả mức giá');
  const [selectedArea, setSelectedArea] = useState('Tất cả diện tích');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    // Handle search logic here
    console.log('Searching with filters:', {
      province: selectedProvince,
      category: selectedCategory,
      price: selectedPrice,
      area: selectedArea,
      keyword: searchKeyword,
    });
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main search bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo từ khóa, địa chỉ..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Province selector */}
            <div className="sm:w-48">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tìm kiếm
            </button>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count.toLocaleString()})
              </button>
            ))}
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức giá
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diện tích
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <select className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Tin mới nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
                <option>Diện tích nhỏ đến lớn</option>
                <option>Diện tích lớn đến nhỏ</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedPrice('Tất cả mức giá');
                  setSelectedArea('Tất cả diện tích');
                  setSelectedProvince('Tất cả');
                  setSelectedCategory('all');
                  setSearchKeyword('');
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
