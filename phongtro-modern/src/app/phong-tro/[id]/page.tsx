import PropertyDetailPage from './PropertyDetailPage';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  await params;
  
  // Mock data - trong thực tế sẽ fetch từ API
  const mockProperty = {
    title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
    description: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...- ĐỦ ĐIỀU HÒA, NÓNG LẠNH, TỦ LẠNH. KHÉP KÍN, CÓ BAN CÔNG.'
  };
  
  return {
    title: `${mockProperty.title} | NhaTroVN`,
    description: mockProperty.description.substring(0, 160) + '...',
  };
}

export default function Page({ params }: PageProps) {
  return <PropertyDetailPage params={params} />;
}