'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './ClientLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Nếu là trang dashboard, admin, lịch hẹn, chat, thông báo - không sử dụng ClientLayout (ẩn header top)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/lich-hen') || pathname.startsWith('/chat') || pathname.startsWith('/thong-bao')) {
    return <>{children}</>;
  }
  
  // Các trang khác sử dụng ClientLayout
  return <ClientLayout>{children}</ClientLayout>;
}
