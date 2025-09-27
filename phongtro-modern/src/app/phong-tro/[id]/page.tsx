import PropertyDetailPage from './PropertyDetailPage';

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <PropertyDetailPage postId={params.id} />;
}