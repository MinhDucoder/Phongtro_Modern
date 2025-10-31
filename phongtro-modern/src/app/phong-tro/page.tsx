import SearchResults from '@/components/search/SearchResults';
import { Suspense } from 'react';

export default function PhongTroPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cho thuê phòng trọ</h1>
          <p className="text-gray-600">
            Tìm kiếm phòng trọ cho thuê giá rẻ, chất lượng, đầy đủ tiện nghi
          </p>
        </div>
        
        <Suspense fallback={null}>
          <SearchResults
            initialFilters={{ propertyType: 'phong-tro' }}
          />
        </Suspense>

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
