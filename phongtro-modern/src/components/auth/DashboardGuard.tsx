'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chờ loading xong
    if (isLoading) return;

    // Nếu chưa đăng nhập
    if (!isAuthenticated) {
      router.push('/dang-nhap?redirect=/dashboard');
      return;
    }

    // Nếu đã đăng nhập nhưng không phải landlord hoặc admin
    if (user?.role !== 'landlord' && user?.role !== 'admin') {
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

  // Nếu chưa đăng nhập hoặc không có quyền, không hiển thị gì
  if (!isAuthenticated || (user?.role !== 'landlord' && user?.role !== 'admin')) {
    return null;
  }

  // Nếu có quyền, hiển thị nội dung
  return <>{children}</>;
}
