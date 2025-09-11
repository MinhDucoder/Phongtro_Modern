import SearchResults from '@/components/search/SearchResults';

export default function NhaNguyenCanPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cho thuê nhà nguyên căn</h1>
          <p className="text-gray-600">
            Tìm kiếm nhà nguyên căn cho thuê với đầy đủ tiện nghi, vị trí thuận lợi
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
  title: 'Cho thuê nhà nguyên căn | Phongtro123.com',
  description: 'Tìm kiếm nhà nguyên căn cho thuê giá rẻ, chính chủ, đầy đủ tiện nghi tại Hà Nội, TP.HCM',
  keywords: 'cho thuê nhà nguyên căn, nhà cho thuê, thuê nhà, nhà trọ nguyên căn'
};
