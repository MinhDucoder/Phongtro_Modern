import { Suspense } from 'react';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import SearchResults from '@/components/search/SearchResults';
import SearchMap from '@/components/search/SearchMap';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm nâng cao</h1>
              <p className="text-gray-600 mt-1">
                Tìm kiếm phòng trọ với bộ lọc chi tiết và bản đồ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="animate-pulse bg-white rounded-lg h-32"></div>}>
          <AdvancedSearch initialParams={params} />
        </Suspense>

        {/* Results Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Results */}
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-lg h-48"></div>
                ))}
              </div>
            }>
              <SearchResults searchParams={params} />
            </Suspense>
          </div>

          {/* Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Suspense fallback={
                <div className="animate-pulse bg-white rounded-lg h-96"></div>
              }>
                <SearchMap searchParams={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Tìm kiếm nâng cao - Phòng trọ | NhaTroVN',
  description: 'Tìm kiếm phòng trọ với bộ lọc nâng cao, bản đồ và nhiều tiêu chí chi tiết.',
};
