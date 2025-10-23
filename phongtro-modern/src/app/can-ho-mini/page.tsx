import SearchResults from '@/components/search/SearchResults';

export default function CanHoMiniPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cho thuê căn hộ mini</h1>
          <p className="text-gray-600">
            Tìm căn hộ mini giá rẻ, đầy đủ tiện nghi, phù hợp cho sinh viên và người độc thân
          </p>
        </div>
        
        <SearchResults
          initialFilters={{ propertyType: 'can-ho-mini' }}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Cho thuê căn hộ mini | NhaTroVN',
  description: 'Tìm căn hộ mini cho thuê giá rẻ, đầy đủ tiện nghi tại TP.HCM, Hà Nội. Phù hợp cho sinh viên, người độc thân.',
  keywords: 'căn hộ mini, cho thuê căn hộ mini, mini apartment, studio apartment'
};
