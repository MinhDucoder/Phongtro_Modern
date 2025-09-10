import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PropertyAnalytics from '@/components/analytics/PropertyAnalytics';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <PropertyAnalytics />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Phân tích tin đăng | Phongtro123.com',
  description: 'Theo dõi hiệu quả tin đăng với analytics chi tiết.',
};
