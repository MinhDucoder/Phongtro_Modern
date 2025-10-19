import SearchResults from '@/components/search/SearchResults';

export default function OGhepPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm người ở ghép</h1>
          <p className="text-gray-600">
            Tìm kiếm phòng ở ghép, chia sẻ chi phí, kết bạn mới trong cuộc sống
          </p>
        </div>
        
        <SearchResults
          initialFilters={{ propertyType: 'o-ghep' }}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Tìm người ở ghép | NhaTroVN',
  description: 'Tìm kiếm phòng ở ghép, chia sẻ chi phí, kết bạn mới tại Hà Nội, TP.HCM',
  keywords: 'tìm người ở ghép, ở ghép, chia phòng, share room, ở chung'
};
