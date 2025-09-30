'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tokenCheck, setTokenCheck] = useState<'checking' | 'valid' | 'invalid'>('checking');

  // Handle session expiry specifically for dashboard
  const { refreshToken } = useTokenRefresh({
    redirectTo: '/dang-nhap',
    showToast: true
  });

  // Check token status on mount and periodically
  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      const tokenStatus = authApi.getTokenStatus();
      
      if (!tokenStatus.hasToken) {
        setTokenCheck('invalid');
        return;
      }
      
      if (tokenStatus.isExpired) {
        try {
          const refreshed = await refreshToken();
          setTokenCheck(refreshed ? 'valid' : 'invalid');
        } catch {
          setTokenCheck('invalid');
        }
      } else {
        setTokenCheck('valid');
      }
    };

    checkTokenAndRedirect();
  }, [refreshToken]);

  useEffect(() => {
    // Wait for both auth loading and token check
    if (isLoading || tokenCheck === 'checking') return;

    // If token is invalid, redirect to login
    if (tokenCheck === 'invalid' || !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/dang-nhap?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If authenticated but wrong role, redirect home
    if (user?.role !== 'landlord' && user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, isLoading, router, tokenCheck]);

  // Show loading while checking auth and tokens
  if (isLoading || tokenCheck === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {tokenCheck === 'checking' ? 'Đang xác thực...' : 'Đang kiểm tra quyền truy cập...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if token invalid or wrong role
  if (tokenCheck === 'invalid' || !isAuthenticated || (user?.role !== 'landlord' && user?.role !== 'admin')) {
    return null;
  }

  // Nếu có quyền, hiển thị nội dung
  return <>{children}</>;
}
