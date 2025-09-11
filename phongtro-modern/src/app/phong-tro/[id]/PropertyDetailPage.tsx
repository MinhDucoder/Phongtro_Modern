'use client';

import PropertyDetail from '@/components/property/PropertyDetail';

// Mock data - trong thực tế sẽ fetch từ API
const mockProperty = {
  id: '1',
  title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
  price: '3.8 triệu/tháng',
  area: '25 m²',
  location: 'Hai Bà Trưng, Hà Nội',
  address: 'Ngõ 3 Trần Khát Chân, Hai Bà Trưng, Hà Nội',
  images: [
    '/placeholder-room.svg',
    '/placeholder-room.svg',
    '/placeholder-room.svg',
    '/placeholder-room.svg',
  ],
  description: `
    PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...- ĐỦ ĐIỀU HÒA, NÓNG LẠNH, TỦ LẠNH. KHÉP KÍN, CÓ BAN CÔNG.

    🏠 THÔNG TIN CHI TIẾT:
    - Diện tích: 25m²
    - Giá thuê: 3.8 triệu/tháng
    - Địa chỉ: Ngõ 3 Trần Khát Chân, Hai Bà Trưng, Hà Nội
    - Gần các trường: Đại học Dược, Bách Khoa, Kinh tế Quốc dân

    🎯 TIỆN ÍCH:
    ✅ Điều hòa
    ✅ Nóng lạnh
    ✅ Tủ lạnh
    ✅ WiFi miễn phí
    ✅ Bảo vệ 24/7
    ✅ Thang máy
    ✅ Ban công riêng

    📍 VỊ TRÍ:
    - 5 phút đi bộ đến trường Đại học Dược
    - 10 phút đi bộ đến trường Bách Khoa
    - 15 phút đi bộ đến trường Kinh tế Quốc dân
    - Gần chợ, siêu thị, nhà thuốc

    💰 GIÁ THUÊ:
    - Phòng 25m²: 3.8 triệu/tháng
    - Đặt cọc: 1 tháng
    - Phí quản lý: 200k/tháng
    - Điện: 4k/kWh
    - Nước: 25k/m³

    📞 LIÊN HỆ:
    - Chủ nhà: Lê Nhật Duy
    - SĐT: 0365349437
    - Zalo: 0365349437
    - Thời gian: 8h-22h hàng ngày

    🎯 LƯU Ý:
    - Ưu tiên sinh viên
    - Không hút thuốc
    - Giữ gìn vệ sinh chung
    - Tuân thủ nội quy chung cư
  `,
  amenities: [
    'Điều hòa',
    'Nóng lạnh', 
    'Tủ lạnh',
    'WiFi miễn phí',
    'Bảo vệ 24/7',
    'Thang máy',
    'Ban công',
    'Tủ quần áo',
    'Bàn học',
    'Ghế ngồi'
  ],
  contact: {
    name: 'Lê Nhật Duy',
    phone: '0365349437',
    email: 'lenhatduy@email.com',
    isVerified: true,
    responseTime: 'Trong 1 giờ',
    rating: 4.8,
    totalReviews: 156
  },
  postedTime: 'Hôm nay',
  viewCount: 1234,
  likeCount: 89,
  isLiked: false,
  isFeatured: true,
  nearbyPlaces: [
    { name: 'Đại học Dược Hà Nội', distance: '5 phút đi bộ', type: 'Trường học' },
    { name: 'Đại học Bách Khoa Hà Nội', distance: '10 phút đi bộ', type: 'Trường học' },
    { name: 'Đại học Kinh tế Quốc dân', distance: '15 phút đi bộ', type: 'Trường học' },
    { name: 'Chợ Hôm', distance: '3 phút đi bộ', type: 'Chợ' },
    { name: 'Vincom Center', distance: '10 phút đi bộ', type: 'Trung tâm thương mại' }
  ],
  similarProperties: [
    {
      id: '2',
      title: 'Phòng trọ gần Bách Khoa, đầy đủ tiện nghi',
      price: '4.2 triệu/tháng',
      area: '28 m²',
      location: 'Hai Bà Trưng, Hà Nội',
      image: '/placeholder-room.svg',
      distance: '200m'
    },
    {
      id: '3', 
      title: 'Căn hộ mini view đẹp, gần trường',
      price: '3.5 triệu/tháng',
      area: '22 m²',
      location: 'Hai Bà Trưng, Hà Nội',
      image: '/placeholder-room.svg',
      distance: '300m'
    }
  ]
};

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return <PropertyDetail property={mockProperty} />;
}
