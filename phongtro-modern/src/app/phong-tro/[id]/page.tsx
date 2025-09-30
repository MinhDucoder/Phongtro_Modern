import PropertyDetailPage from './PropertyDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // Next.js (App Router) requires awaiting params
  return <PropertyDetailPage postId={id} />;
}