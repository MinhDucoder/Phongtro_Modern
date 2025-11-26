'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import SearchSuggestions from '../search/SearchSuggestions';

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
  'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
];

// Map quận/huyện theo tỉnh
const districtsByProvince: { [key: string]: string[] } = {
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Ba Đình', 'Hai Bà Trưng', 'Hoàn Kiếm', 'Thanh Xuân', 'Tây Hồ', 'Bắc Từ Liêm', 'Nam Từ Liêm', 'Hoàng Mai', 'Long Biên', 'Gia Lâm', 'Thường Tín', 'Thanh Trì'],
  'TP.HCM': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Tân Bình', 'Tân Phú', 'Phú Nhuận', 'Bình Thạnh', 'Gò Vấp', 'Thủ Đức', 'Bình Tân'],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'],
};

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

export default function SearchSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filterModalRef = useRef<HTMLDivElement>(null);
  
  // Chỉ hiển thị thanh tìm kiếm trên một số trang
  const showSearchSection = pathname === '/' || 
                           pathname.startsWith('/tim-kiem') ||
                           pathname.startsWith('/phong') ||
                           pathname.startsWith('/can-ho') ||
                           pathname.startsWith('/nha-nguyen-can') ||
                           pathname.startsWith('/phong-tro') ||
                           pathname.startsWith('/o-ghep') ||
                           pathname.startsWith('/mat-bang');

  const [filters, setFilters] = useState({
    keyword: searchParams?.get('keyword') || '',
    province: searchParams?.get('province') || '',
    district: searchParams?.get('district') || '',
    propertyType: searchParams?.get('propertyType') || '',
    priceRange: searchParams?.get('priceRange') || '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    filters.propertyType ? [filters.propertyType] : []
  );

  // Sync filters with URL params when they change
  useEffect(() => {
    setFilters({
      keyword: searchParams?.get('keyword') || '',
      province: searchParams?.get('province') || '',
      district: searchParams?.get('district') || '',
      propertyType: searchParams?.get('propertyType') || '',
      priceRange: searchParams?.get('priceRange') || '',
    });
  }, [searchParams]);

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
        return [type]; // Only allow single selection
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
    // Đóng suggestions khi bấm tìm kiếm
    setIsSuggestionsOpen(false);
    
    const params = new URLSearchParams();
    
    // Add keyword if present
    if (filters.keyword.trim()) {
      params.set('keyword', filters.keyword.trim());
    }
    
    // Add province if present (and not "Toàn quốc")
    if (filters.province && filters.province !== '') {
      params.set('province', filters.province);
    }
    
    // Add district if present
    if (filters.district && filters.district !== '') {
      params.set('district', filters.district);
    }
    
    // Add price range if present
    if (filters.priceRange && filters.priceRange !== '') {
      params.set('priceRange', filters.priceRange);
    }
    
    // Luôn quay về trang chủ để hiển thị kết quả tìm kiếm (YouTube style)
    router.push(`/?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setIsSuggestionsOpen(false); // Đóng suggestions khi nhấn Enter
    }
  };

  if (!showSearchSection) {
    return null;
  }

  return (
    <>
      {/* Search Section - giống phongtro123.com */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search Input with Suggestions */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng trọ, căn hộ, mặt bằng ..."
                  value={filters.keyword}
                  onChange={(e) => {
                    handleFilterChange('keyword', e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-gray-900 placeholder-gray-500"
                />
                <SearchSuggestions 
                  keyword={filters.keyword} 
                  isOpen={isSuggestionsOpen}
                  onClose={() => setIsSuggestionsOpen(false)}
                  onSelectSuggestion={(selectedKeyword) => {
                    // Cập nhật keyword vào input
                    handleFilterChange('keyword', selectedKeyword);
                    setIsSuggestionsOpen(false);
                    
                    // Tự động thực hiện tìm kiếm ngay lập tức
                    const params = new URLSearchParams();
                    params.set('keyword', selectedKeyword);
                    if (filters.province) params.set('province', filters.province);
                    if (filters.district) params.set('district', filters.district);
                    if (filters.propertyType) params.set('propertyType', filters.propertyType);
                    if (filters.priceRange) params.set('priceRange', filters.priceRange);
                    
                    // Chuyển đến trang tìm kiếm để hiển thị kết quả
                    router.push(`/tim-kiem?${params.toString()}`);
                  }}
                />
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="w-full sm:w-48">
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filters.province}
                  onChange={(e) => {
                    handleFilterChange('province', e.target.value);
                    // Reset district when province changes
                    if (e.target.value !== filters.province) {
                      handleFilterChange('district', '');
                    }
                  }}
                  className="w-full pl-12 pr-10 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-gray-900 appearance-none cursor-pointer bg-white"
                >
                  {provinces.map((province, index) => (
                    <option key={index} value={index === 0 ? '' : province}>
                      {province}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* District Dropdown - Show only if province is selected */}
            {filters.province && filters.province !== '' && districtsByProvince[filters.province] && (
              <div className="w-full sm:w-48">
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full pl-12 pr-10 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-gray-900 appearance-none cursor-pointer bg-white"
                  >
                    <option value="">Tất cả quận/huyện</option>
                    {districtsByProvince[filters.province]?.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:outline-none flex items-center justify-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>
                {filters.priceRange 
                  ? `Giá: ${priceRanges.find(r => r.value === filters.priceRange)?.label || 'Bộ lọc'}`
                  : 'Bộ lọc'
                }
              </span>
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white text-base font-medium rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none flex items-center justify-center gap-2 shadow-lg"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Tìm phòng trọ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel (light overlay without dark backdrop) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pointer-events-none">
          <div ref={filterModalRef} className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto mt-6">
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
            <div className="p-5 md:p-6 space-y-6">
              {/* Price Range Only */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Khoảng giá</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleFilterChange('priceRange', range.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        filters.priceRange === range.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 md:p-6 border-t border-gray-200 bg-gray-50">
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
    </>
  );
}