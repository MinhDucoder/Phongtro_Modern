import SearchResults from '@/components/search/SearchResults';

export default function CanHoDichVuPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cho thuê căn hộ dịch vụ</h1>
          <p className="text-gray-600">
            Tìm căn hộ dịch vụ tiện nghi, dọn vào ở ngay, đầy đủ nội thất và dịch vụ.
          </p>
        </div>
        
        <SearchResults
          initialFilters={{ propertyType: 'can-ho-dich-vu' }}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Cho thuê căn hộ dịch vụ | NhaTroVN',
  description: 'Tìm căn hộ dịch vụ đầy đủ nội thất, dọn vào ở ngay tại TP.HCM, Hà Nội và các tỉnh thành.',
  keywords: 'căn hộ dịch vụ, cho thuê căn hộ dịch vụ, serviced apartment'
};


