'use client';

import DashboardLayoutFixed from '@/components/dashboard/DashboardLayoutFixed';
import PaymentHistory from '@/components/payment/PaymentHistory';

export default function PaymentHistoryPage() {
  return (
    <DashboardLayoutFixed>
      <PaymentHistory />
    </DashboardLayoutFixed>
  );
}
