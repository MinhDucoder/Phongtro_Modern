'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { toastManager } from '@/components/ui/ToastManager';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = '/dang-nhap',
  requireAuth = true
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Đợi loading xong và đã check auth
    if (loading) return;

    // Thêm delay để đợi AuthContext restore state
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 1000); // Đợi 1 giây

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    // Chỉ redirect sau khi đã check auth và đợi đủ thời gian
    if (loading || !hasCheckedAuth) return;

    console.log('🔐 ProtectedRoute check:', {
      isAuthenticated,
      user: user ? { id: user._id, role: user.role } : null,
      loading,
      hasCheckedAuth
    });

    // Nếu cần đăng nhập nhưng chưa đăng nhập
    if (requireAuth && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      toastManager.showError('Vui lòng đăng nhập để truy cập trang này');
      router.push(redirectTo);
      return;
    }

    // Nếu cần role cụ thể nhưng không có quyền
    if (requireAuth && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      console.log('❌ Wrong role, redirecting home');
      toastManager.showError('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, loading, hasCheckedAuth, allowedRoles, redirectTo, requireAuth, router]);

  // Đang loading hoặc chưa check auth
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập và cần đăng nhập
  if (requireAuth && !isAuthenticated) {
    return null; // Sẽ redirect
  }

  // Đã đăng nhập nhưng không có quyền
  if (requireAuth && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null; // Sẽ redirect
  }

  return <>{children}</>;
}

// Convenience components
export function AuthRequired({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
}

export function LandlordOnly({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['landlord', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}
