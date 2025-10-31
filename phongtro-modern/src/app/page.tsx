'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import SearchResults from '@/components/search/SearchResults';
import { Post } from '@/lib/api';
import RoomCard from '@/components/room/RoomCard';
import { toastManager } from '@/components/ui/ToastManager';

import Link from 'next/link';

import StatsOverview from '@/components/stats/StatsOverview';
import RealTimeCounter from '@/components/stats/RealTimeCounter';
import TrendingChart from '@/components/stats/TrendingChart';
import Chatbot from '@/components/chatbot/chat';


function HomeInner() {
  const searchParams = useSearchParams();
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

  // Check if we have search params (keyword or province)
  const hasSearchParams = searchParams?.has('keyword') || searchParams?.has('province');

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
    if (!hasSearchParams) {
      fetchFeaturedPosts(currentPage);
    }
  }, [currentPage, hasSearchParams]);

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
          toastManager.showWarning('Chưa có tin đăng nào được duyệt. Vui lòng chờ admin duyệt tin.');
        }
      } else {
        console.error('Invalid response structure:', data);
        console.error('Expected: data.success && data.data && data.data.items');
        console.error('Got - success:', data.success);
        console.error('Got - data:', data.data);
        console.error('Got - items:', data.data?.items);
        toastManager.showError('Dữ liệu không hợp lệ từ server');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toastManager.showError('Không thể kết nối API. Vui lòng kiểm tra server.');
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
        {/* If user searched, show search results */}
        {hasSearchParams && (
          <SearchResults />
        )}
        
        {/* Otherwise show featured posts */}
        {!hasSearchParams && (
          <>
          {/* Main Content */}
          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Statistics Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Kênh thông tin Phòng Trọ số 1 Việt Nam
              </h1>
              <p className="text-gray-600">
                Có <span className="font-bold text-orange-600">76.731</span> tin đăng cho thuê
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">130.000+</div>
                <div className="text-sm text-gray-500">Chủ nhà & Môi giới</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">200.000+</div>
                <div className="text-sm text-gray-500">Tin đăng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1.000+</div>
                <div className="text-sm text-gray-500">Tin đăng/ngày</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">3.000.000+</div>
                <div className="text-sm text-gray-500">Lượt xem/tháng</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Tin đăng cho thuê
              </h2>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
                  Đề xuất
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-orange-600 text-sm font-medium">
                  Mới đăng
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-orange-600 text-sm font-medium">
                  Có video
                </button>
              </div>
            </div>
          </div>

          {/* Property Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
                  favoriteId={undefined} // TODO: Get from API response
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
          </>
        )}
      </div>

      {/* Why Choose Us Section - Only show when not searching */}
      {!hasSearchParams && (
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
      )}
      <Chatbot
        title="Hỏi trợ lý AI"
        placeholder="Nhập câu hỏi... (Enter để gửi)"
        welcome="Xin chào 👋 Mình là trợ lý AI. Bạn cần tìm phòng hay hỗ trợ gì?"
        endpoint="/api/chatbot"
      />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
