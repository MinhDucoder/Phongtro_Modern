'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import ClientLayout from './ClientLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Memoize the decision to avoid re-renders
  const shouldUseClientLayout = useMemo(() => {
    // Nếu là trang dashboard, admin, lịch hẹn, chat, thông báo - không sử dụng ClientLayout (ẩn header top)
    return !(pathname.startsWith('/dashboard') || 
             pathname.startsWith('/admin') || 
             pathname.startsWith('/lich-hen') || 
             pathname.startsWith('/chat') || 
             pathname.startsWith('/thong-bao'));
  }, [pathname]);
  
  // Các trang khác sử dụng ClientLayout
  return shouldUseClientLayout ? <ClientLayout>{children}</ClientLayout> : <>{children}</>;
}
