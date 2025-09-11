import { notFound } from 'next/navigation';
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

    🏠 THÔNG TIN PHÒNG:
    - Diện tích: 25m²
    - Đầy đủ nội thất: giường, tủ, bàn học, điều hòa, nóng lạnh
    - Có ban công, cửa sổ thoáng mát
    - WC riêng, khép kín

    📍 VỊ TRÍ:
    - Gần trường Đại học Dược Hà Nội
    - Gần trường Đại học Bách Khoa
    - Gần trường Đại học Kinh tế Quốc dân
    - Gần bệnh viện, chợ, siêu thị

    💰 GIÁ THUÊ: 3.8 triệu/tháng
    - Điện: 4.000đ/số
    - Nước: 25.000đ/người/tháng
    - Internet: Miễn phí
    - Giữ xe: 50.000đ/tháng

    ✅ TIỆN ÍCH:
    - Camera an ninh 24/7
    - Thang máy
    - Giờ giấc tự do
    - Cho phép nấu ăn
  `,
  contact: {
    name: 'Lê Nhật Duy',
    phone: '0365349437',
    avatar: '/placeholder-room.svg',
    isVerified: true,
    joinedDate: 'Tham gia từ 2023',
  },
  postedTime: 'Hôm nay',
  viewCount: 1234,
  isFeatured: true,
  amenities: [
    'Điều hòa',
    'Nóng lạnh',
    'Tủ lạnh',
    'Giường',
    'Tủ quần áo',
    'Bàn học',
    'WiFi miễn phí',
    'Camera an ninh',
    'Thang máy',
    'Cho phép nấu ăn',
    'Giờ giấc tự do',
    'WC riêng'
  ],
  rules: [
    'Không hút thuốc trong phòng',
    'Không nuôi thú cưng',
    'Giữ gìn vệ sinh chung',
    'Không làm ồn sau 22h',
    'Báo trước khi có khách qua đêm'
  ],
  nearbyPlaces: [
    { name: 'Đại học Dược Hà Nội', distance: '200m', type: 'university' as const },
    { name: 'Đại học Bách Khoa', distance: '500m', type: 'university' as const },
    { name: 'Chợ Hôm', distance: '300m', type: 'market' as const },
    { name: 'Bệnh viện Bạch Mai', distance: '1km', type: 'hospital' as const },
    { name: 'Siêu thị Big C', distance: '800m', type: 'supermarket' as const },
  ]
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Trong thực tế sẽ fetch data từ API theo id
  if (id !== '1') {
    notFound();
  }

  return <PropertyDetail property={mockProperty} />;
}

export async function generateMetadata({ params }: PageProps) {
  await params;
  
  // Trong thực tế sẽ fetch data từ API
  return {
    title: `${mockProperty.title} | Phongtro123.com`,
    description: mockProperty.description.substring(0, 160) + '...',
  };
}
