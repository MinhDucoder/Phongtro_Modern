import SearchResults from '@/components/search/SearchResults';

export default function MatBangPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cho thuê mặt bằng kinh doanh</h1>
          <p className="text-gray-600">
            Tìm kiếm mặt bằng kinh doanh cho thuê, vị trí đẹp, phù hợp mọi ngành nghề
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
  title: 'Cho thuê mặt bằng kinh doanh | Phongtro123.com',
  description: 'Tìm kiếm mặt bằng kinh doanh cho thuê giá rẻ, vị trí đẹp tại Hà Nội, TP.HCM',
  keywords: 'cho thuê mặt bằng, mặt bằng kinh doanh, thuê mặt bằng, shop cho thuê'
};
