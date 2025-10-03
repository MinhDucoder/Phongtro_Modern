'use client';

import { useState, useEffect } from 'react';
import SearchFilter from '@/components/ui/SearchFilter';
import PropertyCard from '@/components/ui/PropertyCard';
import Pagination from '@/components/ui/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import { roomApi, Room, Post } from '@/lib/api';
import RoomCard from '@/components/room/RoomCard';
import { toastManager } from '@/components/ui/ToastManager';
import StatsOverview from '@/components/stats/StatsOverview';
import RealTimeCounter from '@/components/stats/RealTimeCounter';
import TrendingChart from '@/components/stats/TrendingChart';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasShownToast, setHasShownToast] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('hasShownPostsToast') === 'true';
    }
    return false;
  });
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    // Reset toast flag khi F5 (reload trang)
    if (typeof window !== 'undefined') {
      const handleBeforeUnload = () => {
        sessionStorage.removeItem('hasShownPostsToast');
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  useEffect(() => {
    fetchFeaturedPosts(currentPage);
  }, [currentPage]);

  const fetchFeaturedPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      console.log('Fetching approved posts from API...');
      
      // Chỉ lấy các post đã được duyệt (status = active)
      // Thêm timestamp để tránh cache
      const timestamp = Date.now();
      const url = `http://localhost:5000/api/v1/posts?page=${page}&limit=${ITEMS_PER_PAGE}&_t=${timestamp}`;
      console.log('Calling API URL:', url);
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
        const posts = data.data.items;
        console.log('Posts received:', posts.length);
        console.log('Sample post data:', posts[0]);
        console.log('Setting posts state...');
        setPosts(posts);
        setTotalPages(Math.ceil(data.data.total / ITEMS_PER_PAGE));
        console.log('Posts state updated. Current posts array length:', posts.length);
        
        if (posts.length > 0 && !hasShownToast) {
          toastManager.showSuccess(`Đã tải ${posts.length} tin đăng đã duyệt từ database`);
          setHasShownToast(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('hasShownPostsToast', 'true');
          }
        } else if (posts.length === 0) {
          console.log('No approved posts available');
          toast('Chưa có tin đăng nào được duyệt. Vui lòng chờ admin duyệt tin.', {
            icon: '⚠️',
            style: {
              background: '#fbbf24',
              color: '#92400e',
            },
          });
        }
      } else {
        console.error('Invalid response structure:', data);
        console.error('Expected: data.success && data.data && data.data.items');
        console.error('Got - success:', data.success);
        console.error('Got - data:', data.data);
        console.error('Got - items:', data.data?.items);
        toast.error('Dữ liệu không hợp lệ từ server');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Không thể kết nối API. Vui lòng kiểm tra server.');
      setPosts([]);
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

  return (
    <>
      <StructuredData 
        type="website" 
        data={null} 
      />
      <StructuredData 
        type="organization" 
        data={null} 
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Kênh thông tin Phòng Trọ số 1 Việt Nam
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Có <span className="font-bold">75.839</span> tin đăng cho thuê
          </p>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div>
              <div className="text-3xl font-bold">130.000+</div>
              <div className="text-sm opacity-90">Chủ nhà & Môi giới</div>
            </div>
            <div>
              <div className="text-3xl font-bold">200.000+</div>
              <div className="text-sm opacity-90">Tin đăng</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1.000+</div>
              <div className="text-sm opacity-90">Tin đăng/ngày</div>
            </div>
            <div>
              <div className="text-3xl font-bold">3.000.000+</div>
              <div className="text-sm opacity-90">Lượt xem/tháng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Filter */}
      <SearchFilter />


      {/* Property Listings */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-darker">
            Tin đăng cho thuê đã được duyệt
          </h2>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Đề xuất
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
              Mới đăng
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
              Có video
            </button>
            <a 
              href="/phong" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Xem tất cả
            </a>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              console.log('Rendering posts. Total posts:', posts.length);
              return null;
            })()}
            {posts.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Chưa có bài đăng nào được duyệt</p>
              </div>
            )}
            {posts.map((post, index) => {
              console.log(`Rendering post ${index}:`, {
                postId: post._id,
                hasRoomId: !!post.roomId,
                roomTitle: post.roomId?.title
              });
              return post.roomId ? (
                <RoomCard
                  key={post._id}
                  room={{
                    ...post.roomId,
                    _id: post._id, // Sử dụng post._id thay vì room._id
                    // Thêm thông tin từ post nếu cần
                    postId: post._id,
                    status: post.status,
                    favouriteLevel: post.favouriteLevel,
                    options: post.options || [],
                    contact: post.contact || undefined
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(post._id)}
                  onToggleSaved={handleToggleSaved}
                  isSaved={savedProperties.includes(post._id)}
                  favoriteId={null} // TODO: Get from API response
                />
              ) : (
                <div key={post._id} className="bg-red-100 p-4 rounded">
                  <p className="text-red-600">Post thiếu room data: {post._id}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12">
          {!loading && totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              baseUrl="/" 
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-darker mb-4">
              Tại sao lại chọn NhaTroVN?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi biết bạn có rất nhiều lựa chọn, nhưng NhaTroVN tự hào là trang web 
              đứng top google về các từ khóa: cho thuê phòng trọ, nhà trọ, thuê nhà nguyên căn...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-darker mb-2">Đa dạng</h3>
              <p className="text-sm text-gray-600">
                Hàng nghìn tin đăng được cập nhật liên tục
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-darker mb-2">Uy tín</h3>
              <p className="text-sm text-gray-600">
                Thông tin chính xác, đã được kiểm duyệt
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-darker mb-2">Hiệu quả</h3>
              <p className="text-sm text-gray-600">
                Tìm kiếm nhanh chóng, kết nối trực tiếp
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-darker mb-2">Tiết kiệm</h3>
              <p className="text-sm text-gray-600">
                Chi phí thấp, nhiều gói dịch vụ
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold text-darker mb-2">Cải tiến</h3>
              <p className="text-sm text-gray-600">
                Luôn cập nhật, nâng cấp trải nghiệm
              </p>
            </div>
          </div>
        </div>
        </section>
      </div>
    </>
  );
}