'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { toastManager } from '@/components/ui/ToastManager';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
  showToast?: boolean;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  redirectTo = '/',
  showToast = true
}: RoleGuardProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Đang loading, chưa xác định được auth state

    // Chưa đăng nhập
    if (!isAuthenticated || !user) {
      if (showToast) {
        toastManager.showError('Vui lòng đăng nhập để truy cập tính năng này');
      }
      router.push('/dang-nhap');
      return;
    }

    // Đã đăng nhập nhưng không có quyền
    if (!allowedRoles.includes(user.role)) {
      if (showToast) {
        toastManager.showError('Bạn không có quyền truy cập tính năng này');
      }
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, user, loading, allowedRoles, redirectTo, showToast, router]);

  // Đang loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // Không có quyền
  if (!allowedRoles.includes(user.role)) {
    return fallback;
  }

  // Có quyền, hiển thị children
  return <>{children}</>;
}

// Convenience components for specific roles
export function UserGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['user', 'landlord', 'admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function LandlordGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['landlord', 'admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AdminGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// Hook để check role
export function useRoleCheck() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };

  const isUser = () => hasRole(['user', 'landlord', 'admin']);
  const isLandlord = () => hasRole(['landlord', 'admin']);
  const isAdmin = () => hasRole(['admin']);

  return {
    hasRole,
    isUser,
    isLandlord,
    isAdmin,
    userRole: user?.role,
    isAuthenticated
  };
}


