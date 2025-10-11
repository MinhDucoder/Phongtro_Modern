'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MyPostings from '@/components/dashboard/MyPostings';
import { toastManager } from '@/components/ui/ToastManager';

export default function MyPostingsPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Kiểm tra payment status từ URL
    const paymentStatus = searchParams.get('payment');
    const packageName = searchParams.get('package');
    
    if (paymentStatus === 'success') {
      toastManager.showSuccess(`Thanh toán thành công! Bạn đã nâng cấp lên gói ${packageName}`);
      // Remove payment params from URL
      window.history.replaceState({}, '', '/dashboard/tin-dang');
    } else if (paymentStatus === 'failed') {
      toastManager.showError('Thanh toán thất bại. Vui lòng thử lại.');
      window.history.replaceState({}, '', '/dashboard/tin-dang');
    }
  }, [searchParams]);

  return (
    <DashboardLayout>
      <MyPostings />
    </DashboardLayout>
  );
}

