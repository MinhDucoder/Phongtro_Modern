import SearchFilter from '@/components/ui/SearchFilter';
import PropertyCard from '@/components/ui/PropertyCard';
import Pagination from '@/components/ui/Pagination';

// Mock data - sẽ được thay thế bằng API call
const mockProperties = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Phòng trọ ${i + 1} - Gần trường đại học, đầy đủ tiện nghi, giá tốt`,
  price: `${(Math.random() * 3 + 2).toFixed(1)} triệu/tháng`,
  area: `${Math.floor(Math.random() * 30 + 15)} m²`,
  location: ['Hai Bà Trưng, Hà Nội', 'Bình Thạnh, Hồ Chí Minh', 'Thanh Xuân, Hà Nội', 'Quận 1, Hồ Chí Minh'][Math.floor(Math.random() * 4)],
  images: ['/placeholder-room.svg'],
  description: 'Phòng trọ đầy đủ tiện nghi, gần trường đại học, siêu thị, bệnh viện. Giá thuê hợp lý, chủ nhà thân thiện.',
  contact: {
    name: ['Anh Minh', 'Chị Hoa', 'Anh Nam', 'Chị Lan'][Math.floor(Math.random() * 4)],
    phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  },
  postedTime: ['Hôm nay', '1 giờ trước', '2 giờ trước', 'Hôm qua'][Math.floor(Math.random() * 4)],
  isFeatured: Math.random() > 0.8,
}));

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PhongTroPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;
  
  // Simulate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProperties = mockProperties.slice(startIndex, endIndex);
  const totalPages = Math.ceil(mockProperties.length / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cho thuê phòng trọ</h1>
              <p className="text-gray-600 mt-1">
                Tìm thấy <span className="font-semibold">{mockProperties.length}</span> kết quả
              </p>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Sắp xếp:</span>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Tin mới nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
                <option>Diện tích nhỏ đến lớn</option>
                <option>Diện tích lớn đến nhỏ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <SearchFilter />

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            Phòng trọ
            <button className="ml-2 text-blue-600 hover:text-blue-800">×</button>
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            Hà Nội
            <button className="ml-2 text-blue-600 hover:text-blue-800">×</button>
          </span>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            Xóa tất cả bộ lọc
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/phong-tro"
        />

        {/* SEO Content */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Cho thuê phòng trọ giá rẻ, chất lượng</h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Tìm kiếm <strong>phòng trọ cho thuê</strong> chất lượng, giá rẻ tại Hà Nội, TP.HCM và các tỉnh thành khác. 
              Chúng tôi cung cấp hàng nghìn tin đăng cho thuê phòng trọ được cập nhật liên tục, 
              đảm bảo thông tin chính xác và đáng tin cậy.
            </p>
            <p className="mb-4">
              <strong>Ưu điểm khi thuê phòng trọ qua NhaTroVN:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Thông tin chi tiết, hình ảnh rõ nét</li>
              <li>Giá cả minh bạch, không phát sinh</li>
              <li>Liên hệ trực tiếp với chủ nhà</li>
              <li>Hỗ trợ tư vấn 24/7</li>
              <li>An toàn, bảo mật thông tin</li>
            </ul>
            <p>
              Hãy liên hệ ngay với chúng tôi để tìm được căn phòng trọ ưng ý nhất!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Cho thuê phòng trọ giá rẻ, chính chủ | NhaTroVN',
  description: 'Tìm kiếm phòng trọ cho thuê giá rẻ, chất lượng tại Hà Nội, TP.HCM. Hàng nghìn tin đăng chính chủ, cập nhật liên tục.',
};
