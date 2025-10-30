'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RoomCard from '@/components/room/RoomCard';
import Pagination from '@/components/ui/Pagination';
import { toastManager } from '@/components/ui/ToastManager';
import { toBackendPropertyType } from '@/lib/propertyTypeMapping';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  _id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  location?: {
    province: string;
    district: string;
    ward: string;
    address: string;
  };
  type: string;
  amenities: string[];
  images: string[];
  user: {
    username: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SearchResultsProps {
  initialQuery?: string;
  initialFilters?: Record<string, string>;
}

export default function SearchResults({ initialQuery = '', initialFilters = {} }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  const query = searchParams.get('keyword') || initialQuery;
  const propertyType = searchParams.get('propertyType') || initialFilters.propertyType || '';
  const province = searchParams.get('province') || initialFilters.province || '';
  const district = searchParams.get('district') || initialFilters.district || '';
  const priceRange = searchParams.get('priceRange') || initialFilters.priceRange || '';
  const areaRange = searchParams.get('areaRange') || initialFilters.areaRange || '';
  const amenities = searchParams.get('amenities') || initialFilters.amenities || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Determine if we're on a category page (phong-tro, nha-nguyen-can, etc.)
  const getCategoryBaseUrl = () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (pathname.includes('/phong-tro')) return '/phong-tro';
    if (pathname.includes('/nha-nguyen-can')) return '/nha-nguyen-can';
    if (pathname.includes('/can-ho')) return '/can-ho';
    if (pathname.includes('/can-ho-mini')) return '/can-ho-mini';
    if (pathname.includes('/can-ho-dich-vu')) return '/can-ho-dich-vu';
    if (pathname.includes('/o-ghep')) return '/o-ghep';
    if (pathname.includes('/mat-bang')) return '/mat-bang';
    if (pathname.includes('/tim-kiem')) return '/tim-kiem';
    return '/phong-tro'; // Default to phong-tro
  };

  useEffect(() => {
    setCurrentPage(page);
    performSearch();
  }, [searchParams, page]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      // Fallback: lấy dữ liệu trực tiếp từ database theo propertyType (nếu có)
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', '12');
      // Convert frontend propertyType format to backend format for fallback API
      if (propertyType) {
        const backendType = toBackendPropertyType(propertyType);
        queryParams.set('propertyType', backendType);
      }
      if (query) queryParams.set('q', query);
      if (province) queryParams.set('province', province);
      if (district) queryParams.set('district', district);
      if (priceRange) queryParams.set('priceRange', priceRange);
      
      const fallbackUrl = `http://localhost:5000/api/v1/posts?${queryParams.toString()}`;

      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData: unknown = await fallbackResponse.json();

      if ((fallbackData as { success?: boolean })?.success) {
        // Map dữ liệu - xử lý cả MeiliSearch và MongoDB format
        type FallbackItem = {
          _id?: string;
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          area?: number;
          location?: { 
            province?: string; 
            city?: string;
            district?: string; 
            ward?: string; 
            address?: string;
          };
          type?: string;
          propertyType?: string;
          amenities?: string[];
          images?: string[] | Array<{url: string}>;
          createdAt?: string;
          updatedAt?: string;
          roomId?: {
            _id?: string;
            title?: string;
            description?: string;
            price?: number;
            area?: number;
            location?: { province?: string; district?: string; ward?: string; address?: string };
            propertyType?: string;
            amenities?: string[];
            images?: string[] | Array<{url: string}>;
            city?: string;
            address?: string;
          };
        };

        const itemsSource = (fallbackData as { data?: { items?: unknown; total?: number } })?.data?.items;
        const items: SearchResult[] = Array.isArray(itemsSource)
          ? itemsSource.map((pRaw) => {
              const p = pRaw as FallbackItem;
              
              // Xử lý 2 TH: MeiliSearch (flat structure) hoặc MongoDB (nested roomId)
              const isMeiliSearch = !p.roomId && (p.price !== undefined || p.title !== undefined);
              
              if (isMeiliSearch) {
                // MeiliSearch format - dữ liệu đã flat
                const imageUrls = Array.isArray(p.images) 
                  ? p.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean) as string[]
                  : [];
                
                return {
                  _id: p._id || p.id || '',
                  title: p.title || '',
                  description: p.description || '',
                  price: typeof p.price === 'number' ? p.price : 0,
                  area: typeof p.area === 'number' ? p.area : 0,
                  location: {
                    province: p.location?.city || p.location?.province || '',
                    district: p.location?.district || '',
                    ward: p.location?.ward || '',
                    address: p.location?.address || ''
                  },
                  type: p.type || p.propertyType || '',
                  amenities: Array.isArray(p.amenities) ? p.amenities : [],
                  images: imageUrls,
                  user: { username: '', email: '', phone: '' },
                  createdAt: p.createdAt || '',
                  updatedAt: p.updatedAt || ''
                } as SearchResult;
              } else {
                // MongoDB format - dữ liệu nested trong roomId
                const rid = p.roomId ?? {};
                const imageUrls = Array.isArray(rid.images)
                  ? rid.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean) as string[]
                  : [];
                
                const location = rid.location
                  ? {
                      province: rid.location.province ?? (rid.city ?? ''),
                      district: rid.location.district ?? '',
                      ward: rid.location.ward ?? '',
                      address: rid.location.address ?? (rid.address ?? '')
                    }
                  : { province: rid.city ?? '', district: '', ward: '', address: rid.address ?? '' };
                
                return {
                  _id: rid._id || p._id || '',
                  title: rid.title || '',
                  description: rid.description || '',
                  price: typeof rid.price === 'number' ? rid.price : 0,
                  area: typeof rid.area === 'number' ? rid.area : 0,
                  location,
                  type: rid.propertyType || '',
                  amenities: Array.isArray(rid.amenities) ? rid.amenities : [],
                  images: imageUrls,
                  user: { username: '', email: '', phone: '' },
                  createdAt: p.createdAt || '',
                  updatedAt: p.updatedAt || ''
                } as SearchResult;
              }
            })
          : [];

        setResults(items);
        const total = (fallbackData as { data?: { total?: number } })?.data?.total ?? 0;
        setTotalResults(total);
        setTotalPages(Math.ceil(total / 12));
        
        if (items.length === 0) {
          toastManager.showInfo('Không tìm thấy kết quả phù hợp với tìm kiếm của bạn');
        }
      } else {
        toastManager.showError('Lỗi khi tải dữ liệu');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toastManager.showError('Lỗi khi tìm kiếm');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (roomId: string) => {
    setFavorites(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleToggleSaved = (roomId: string) => {
    setSavedProperties(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const getSearchSummary = () => {
    const filters = [];
    if (query) filters.push(`"${query}"`);
    if (propertyType) filters.push(`loại: ${propertyType}`);
    if (province) filters.push(`tại: ${province}`);
    if (district) filters.push(`${district}`);
    if (priceRange) filters.push(`giá: ${priceRange} triệu`);
    if (areaRange) filters.push(`diện tích: ${areaRange}m²`);
    
    return filters.length > 0 ? filters.join(', ') : 'Tất cả tin đăng';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
                Kết quả tìm kiếm
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {loading ? 'Đang tìm kiếm...' : `${totalResults} kết quả cho: ${getSearchSummary()}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4 mr-1" />
                  Danh sách
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <MapIcon className="h-4 w-4 mr-1" />
                  Bản đồ
                </button>
              </div>

              {/* Filter Button */}
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'list' ? (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {results.map((result) => (
                <RoomCard
                  key={result._id}
                  room={{
                    _id: result._id,
                    title: result.title,
                    description: result.description,
                    price: result.price,
                    area: result.area,
                    amenities: result.amenities,
                    images: result.images,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    address: result.location?.address || '',
                    city: result.location?.province || '',
                    isAvailable: true
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(result._id)}
                  onToggleSaved={handleToggleSaved}
                  isSaved={savedProperties.includes(result._id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {results.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy kết quả</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={getCategoryBaseUrl()}
                  onPageChange={(newPage) => {
                    // Build query string with all current filters
                    const params = new URLSearchParams();
                    
                    // Copy all existing params
                    searchParams.forEach((value, key) => {
                      if (key !== 'page') {
                        params.set(key, value);
                      }
                    });
                    
                    // Set new page
                    params.set('page', newPage.toString());
                    
                    // Get the correct base URL (category page or search page)
                    const baseUrl = getCategoryBaseUrl();
                    
                    // Navigate with updated URL
                    router.push(`${baseUrl}?${params.toString()}`);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          /* Map View */
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chế độ xem bản đồ</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tính năng này sẽ được phát triển trong phiên bản tiếp theo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}