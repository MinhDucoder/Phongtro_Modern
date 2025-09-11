import SearchResults from '@/components/search/SearchResults';

export default function CanHoPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cho thuê căn hộ chung cư</h1>
          <p className="text-gray-600">
            Tìm kiếm căn hộ chung cư cho thuê hiện đại, an ninh, tiện nghi đầy đủ
          </p>
        </div>
        
        <SearchResults
          searchParams={{}}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Cho thuê căn hộ chung cư | Phongtro123.com',
  description: 'Tìm kiếm căn hộ chung cư cho thuê giá rẻ, hiện đại, an ninh tại Hà Nội, TP.HCM',
  keywords: 'cho thuê căn hộ, căn hộ chung cư, thuê căn hộ, chung cư cho thuê'
};
