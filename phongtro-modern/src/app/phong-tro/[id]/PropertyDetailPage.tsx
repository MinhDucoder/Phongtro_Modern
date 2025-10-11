'use client';

import { useEffect, useState } from 'react';
import PropertyDetail from '@/components/property/PropertyDetail';
import { postPublicApi } from '@/lib/api';
import PropertyDetailLoading from '@/components/property/PropertyDetailLoading';
import PropertyDetailError from '@/components/property/PropertyDetailError';

interface PropertyDetailPageProps {
  postId: string;
}

export default function PropertyDetailPage({ postId }: PropertyDetailPageProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await postPublicApi.getPostDetail(postId);

        if (response?.data && isMounted) {
          const d: any = response.data;
          const normalized = {
            ...d,
            // Ensure UI can always read room fields from property.room
            room: d.room || d.roomId || {},
            // Provide a consistent contact object
            contact:
              d.contact ||
              (d.landlord
                ? {
                    name: d.landlord.full_name,
                    phone: d.landlord.phone,
                    email: d.landlord.email,
                    avatar: d.landlord.avatar,
                    isVerified: d.landlord.role === 'landlord',
                  }
                : undefined),
          };
          setData(normalized);
        } else if (isMounted) {
          setError('Không tìm thấy tin đăng hoặc tin đã bị xóa.');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Không thể tải dữ liệu tin đăng.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (postId) {
      fetchPostDetail();
    } else {
      setError('Thiếu mã tin đăng.');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (isLoading) {
    return <PropertyDetailLoading />;
  }

  if (error) {
    return <PropertyDetailError message={error} />;
  }

  if (!data) {
    return <PropertyDetailError message="Không có dữ liệu tin đăng." />;
  }

  return <PropertyDetail property={data} />;
}
