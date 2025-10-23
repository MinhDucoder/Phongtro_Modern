'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'redirect'>('checking');

  // Xác thực bằng cookie HttpOnly: gọi thẳng /user/me khi cần
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Nếu AuthContext đã có user và đúng role, cho phép ngay
        if (user && (user.role === 'landlord' || user.role === 'admin')) {
          if (!cancelled) setStatus('allowed');
          return;
        }
        // Nếu đang loading, chờ
        if (isLoading) return;
        // Thử gọi /user/me để lấy user từ cookie
        const res = await authApi.getMe();
        const u = (res as any)?.user;
        if (u && (u.role === 'landlord' || u.role === 'admin')) {
          if (!cancelled) setStatus('allowed');
        } else {
          if (!cancelled) setStatus('redirect');
        }
      } catch (_) {
        if (!cancelled) setStatus('redirect');
      }
    };
    run();
    return () => { cancelled = true; };
  }, [user?._id, user?.role, isLoading]);

  useEffect(() => {
    if (isLoading || status === 'checking') return;
    if (status === 'redirect') {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/dang-nhap?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [status, isLoading, router]);

  // Show loading while checking auth and tokens
  if (isLoading || status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === 'checking' ? 'Đang xác thực...' : 'Đang kiểm tra quyền truy cập...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if token invalid or wrong role
  if (status !== 'allowed') {
    return null;
  }

  // Nếu có quyền, hiển thị nội dung
  return <>{children}</>;
}
