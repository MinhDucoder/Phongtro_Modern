'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const propertyTypes = [
  { value: 'phong-tro', label: 'Phòng trọ', icon: '🏠' },
  { value: 'nha-rieng', label: 'Nhà riêng', icon: '🏘️' },
  { value: 'o-ghep', label: 'Ở ghép', icon: '👥' },
  { value: 'mat-bang', label: 'Mặt bằng', icon: '🏪' },
  { value: 'can-ho-chung-cu', label: 'Căn hộ chung cư', icon: '🏢' },
  { value: 'can-ho-mini', label: 'Căn hộ mini', icon: '🏠' },
  { value: 'can-ho-dich-vu', label: 'Căn hộ dịch vụ', icon: '🏨' },
];

const provinces = [
  'Toàn quốc',
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
];

const priceRanges = [
  { value: '', label: 'Tất cả' },
  { value: 'duoi-1-trieu', label: 'Dưới 1 triệu' },
  { value: '1-2-trieu', label: '1 - 2 triệu' },
  { value: '2-3-trieu', label: '2 - 3 triệu' },
  { value: '3-5-trieu', label: '3 - 5 triệu' },
  { value: '5-7-trieu', label: '5 - 7 triệu' },
  { value: '7-10-trieu', label: '7 - 10 triệu' },
  { value: '10-15-trieu', label: '10 - 15 triệu' },
  { value: 'tren-15-trieu', label: 'Trên 15 triệu' },
];

interface AdvancedSearchProps {
  initialParams: { [key: string]: string | string[] | undefined };
}

export default function AdvancedSearch({ initialParams }: AdvancedSearchProps) {
  const router = useRouter();
  const filterModalRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState({
    keyword: (initialParams.keyword as string) || '',
    propertyType: (initialParams.propertyType as string) || '',
    province: (initialParams.province as string) || '',
    priceRange: (initialParams.priceRange as string) || '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    filters.propertyType ? [filters.propertyType] : []
  );

  // Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterModalRef.current && !filterModalRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedPropertyTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [type]; // Chỉ cho phép chọn một loại
      }
    });
  };

  const applyFilters = () => {
    const updatedFilters = {
      ...filters,
      propertyType: selectedPropertyTypes[0] || '',
    };
    setFilters(updatedFilters);
    setIsFilterOpen(false);
    
    // Trigger search
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    router.push(`/tim-kiem?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    router.push(`/tim-kiem?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng trọ, căn hộ, mặt bằng ..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="w-full sm:w-48">
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filters.province}
                  onChange={(e) => handleFilterChange('province', e.target.value)}
                  className="w-full pl-12 pr-10 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-gray-900 appearance-none cursor-pointer transition-all bg-white"
                >
                  {provinces.map((province, index) => (
                    <option 
                      key={index} 
                      value={index === 0 ? '' : province}
                      className="text-gray-900"
                    >
                      {province}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Button */}
            <div className="w-full sm:w-auto">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-700 text-base font-medium rounded-lg transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 min-w-[120px]"
              >
                <span className="flex items-center justify-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>Bộ lọc</span>
                </span>
              </button>
            </div>

            {/* Search Button */}
            <div className="w-full sm:w-auto">
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white text-base font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 min-w-[120px] shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span>Tìm nhà</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div ref={filterModalRef} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Bộ lọc</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Property Types */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Danh mục cho thuê</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handlePropertyTypeToggle(type.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedPropertyTypes.includes(type.value)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Lọc theo khu vực</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh thành</label>
                    <select
                      value={filters.province}
                      onChange={(e) => handleFilterChange('province', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    >
                      {provinces.map((province, index) => (
                        <option key={index} value={index === 0 ? '' : province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quận huyện</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm">
                      <option>Tất cả</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phường xã</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm">
                      <option>Tất cả</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Khoảng giá</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleFilterChange('priceRange', range.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        filters.priceRange === range.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={applyFilters}
                className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}