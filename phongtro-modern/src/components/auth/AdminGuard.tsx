'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}
// AdminGuard để bảo vệ route admin 
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chờ loading xong
    if (isLoading) return;

    // Nếu chưa đăng nhập
    if (!isAuthenticated) {
      router.push('/dang-nhap?redirect=/admin');
      return;
    }

    // Nếu đã đăng nhập nhưng không phải admin
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Hiển thị loading khi đang kiểm tra
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không phải admin, không hiển thị gì
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Nếu là admin, hiển thị nội dung
  return <>{children}</>;
}
