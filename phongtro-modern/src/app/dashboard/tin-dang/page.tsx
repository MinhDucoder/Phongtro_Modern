'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MyPostings from '@/components/dashboard/MyPostings';
import { toast } from 'react-hot-toast';

export default function MyPostingsPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Kiểm tra payment status từ URL
    const paymentStatus = searchParams.get('payment');
    const packageName = searchParams.get('package');
    
    if (paymentStatus === 'success') {
      toast.success(`🎉 Thanh toán thành công! Bạn đã nâng cấp lên gói ${packageName}`, {
        duration: 5000,
      });
      // Remove payment params from URL
      window.history.replaceState({}, '', '/dashboard/tin-dang');
    } else if (paymentStatus === 'failed') {
      toast.error('❌ Thanh toán thất bại. Vui lòng thử lại.', {
        duration: 5000,
      });
      window.history.replaceState({}, '', '/dashboard/tin-dang');
    }
  }, [searchParams]);

  return (
    <DashboardLayout>
      <MyPostings />
    </DashboardLayout>
  );
}

