'use client';

import { useState, useEffect } from 'react';
import SearchFilter from '@/components/ui/SearchFilter';
import PropertyCard from '@/components/ui/PropertyCard';
import Pagination from '@/components/ui/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import { roomApi, Room } from '@/lib/api';
import RoomCard from '@/components/room/RoomCard';
import toast from 'react-hot-toast';

// Mock data for demonstration
export const properties = [
  {
    id: '1',
    title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
    price: '3.8 triệu/tháng',
    area: '25 m²',
    location: 'Hai Bà Trưng, Hà Nội',
    images: ['/placeholder-room.svg', '/placeholder-room.svg'],
    description: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...- ĐỦ ĐIỀU HÒA, NÓNG LẠNH, TỦ LẠNH. KHÉP KÍN, CÓ BAN CÔNG.',
    contact: {
      name: 'Lê Nhật Duy',
      phone: '0365349437',
      isVerified: true,
    },
    postedTime: 'Hôm nay',
    isFeatured: true,
    viewCount: 1234,
    rating: 4.5,
    amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi miễn phí'],
  },
  {
    id: '2',
    title: 'GẦN NGOẠI THƯƠNG, GTVT, HUTECH, HỒNG BÀNG, UEF, VietVision, Ga Metro',
    price: '3.3 triệu/tháng',
    area: '18 m²',
    location: 'Bình Thạnh, Hồ Chí Minh',
    images: ['/placeholder-room.svg'],
    description: 'Clip video phòng giá 4tr9- Để đảm bảo an ninh cho Sinh Viên ở Ngõ Sen giờ hoạt động từ 6h - 24h',
    contact: {
      name: 'Nhà Trọ Ngõ Sen',
      phone: '0909814679',
      isVerified: false,
    },
    postedTime: 'Hôm nay',
    viewCount: 856,
    rating: 4.2,
    amenities: ['WiFi miễn phí', 'Bảo vệ 24/7', 'Thang máy'],
  },
  {
    id: '3',
    title: 'Ở ghép giường tầng sát vách DH Nguyễn Tất Thành',
    price: '1.3 triệu/tháng',
    area: '30 m²',
    location: 'Quận 4, Hồ Chí Minh',
    images: ['/placeholder-room.svg'],
    description: 'TÂN SINH VIÊN TÌM CHỖ Ở – ĐỪNG VỘI, ĐỌC NGAY NÈ! Homestay Hoàng Phúc – Chuỗi ký túc xá & căn hộ dịch vụ',
    contact: {
      name: 'Hoàng Phúc',
      phone: '0931313570',
      isVerified: true,
    },
    postedTime: 'Hôm nay',
    viewCount: 2341,
    rating: 4.8,
    amenities: ['Giường', 'Tủ quần áo', 'Bàn học', 'WiFi miễn phí'],
  },
  {
    id: '4',
    title: 'Cho thuê phòng trọ khép kín, full đồ khu vực Nam Từ Liêm',
    price: '3.5 triệu/tháng',
    area: '20 m²',
    location: 'Nam Từ Liêm, Hà Nội',
    images: ['/placeholder-room.svg'],
    description: 'Chính chủ cho thuê phòng trong Toà CCMN mới xây. Địa chỉ: Ngõ 133 phố Phú Đô, Nam Từ Liêm',
    contact: {
      name: 'Chủ nhà',
      phone: '0987654321',
      isVerified: true,
    },
    postedTime: '2 giờ trước',
    viewCount: 567,
    rating: 4.0,
    amenities: ['Điều hòa', 'Nóng lạnh', 'Tủ lạnh'],
  },
];

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching featured rooms from API...');
      
      const response = await roomApi.getRooms({ 
        limit: 6, 
        sort: 'createdAt' 
      });
      
      console.log('API Response:', response);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setRooms(response.data);
        toast.success(`Đã tải ${response.data.length} phòng từ database`);
      } else {
        console.log('No data from API or empty response');
        toast('Database chưa có dữ liệu phòng. Vui lòng thêm dữ liệu vào database.', {
          icon: '⚠️',
          style: {
            background: '#fbbf24',
            color: '#92400e',
          },
        });
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể kết nối API. Vui lòng kiểm tra server.');
      setRooms([]);
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
            Tin đăng cho thuê
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
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(room._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12">
          <Pagination 
            currentPage={1} 
            totalPages={10} 
            baseUrl="/" 
          />
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