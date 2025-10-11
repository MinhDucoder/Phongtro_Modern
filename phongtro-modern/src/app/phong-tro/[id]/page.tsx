import PropertyDetailPage from './PropertyDetailPage';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/api/v1/posts/${id}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch post ${id}: ${response.status} ${response.statusText}`);
      return {
        title: 'Phòng trọ - Phongtro Modern',
        description: 'Tìm kiếm phòng trọ, nhà trọ, căn hộ cho thuê tại TP.HCM',
      };
    }
    
    const data = await response.json();
    const post = data.data;
    const room = post.room || post.roomId || {};
    
    const title = room.title || 'Phòng trọ';
    const description = room.description?.substring(0, 160) || `Phòng trọ tại ${room.city || 'TP.HCM'} - Giá ${room.price?.toLocaleString() || 'liên hệ'} VNĐ/tháng`;
    const image = room.images?.[0] || '/placeholder-room.svg';
    
    return {
      title: `${title} - Phongtro Modern`,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: image,
            width: 800,
            height: 600,
            alt: title,
          },
        ],
        type: 'website',
        locale: 'vi_VN',
        siteName: 'Phongtro Modern',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `https://phongtro-modern.vercel.app/phong-tro/${id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Phòng trọ - Phongtro Modern',
      description: 'Tìm kiếm phòng trọ, nhà trọ, căn hộ cho thuê tại TP.HCM',
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // Next.js (App Router) requires awaiting params
  return <PropertyDetailPage postId={id} />;
}