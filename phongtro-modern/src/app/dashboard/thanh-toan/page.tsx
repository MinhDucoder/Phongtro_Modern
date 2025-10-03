'use client';

import { Suspense } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PaymentHistory from '@/components/payment/PaymentHistory';
// import PaymentResultPage from '@/components/payment/PaymentResultPage';
import { useSearchParams } from 'next/navigation';
import PaymentResultPage from '@/components/payment/PaymentResultPage';

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  // Nếu có status từ VNPay callback, hiển thị kết quả thanh toán
  if (status) {
    return <PaymentResultPage />;
  }

  // Ngược lại hiển thị lịch sử thanh toán
  return (
    <DashboardLayout>
      <PaymentHistory />
    </DashboardLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
