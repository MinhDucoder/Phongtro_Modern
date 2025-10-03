'use client';

import { ReactNode } from 'react';

interface SuppressHydrationWarningProps {
  children: ReactNode;
  suppressHydrationWarning?: boolean;
}

/**
 * Component để suppress hydration warning cho các element bị ảnh hưởng bởi browser extension
 * Chỉ sử dụng khi thực sự cần thiết và không ảnh hưởng đến functionality
 */
export default function SuppressHydrationWarning({ 
  children, 
  suppressHydrationWarning = true 
}: SuppressHydrationWarningProps) {
  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  );
}

