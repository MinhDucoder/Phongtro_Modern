import { redirect } from 'next/navigation';
import SchedulingSystem from '@/components/scheduling/SchedulingSystem';

// Mock auth check
const isAuthenticated = true;

export default function SchedulingPage() {
  if (!isAuthenticated) {
    redirect('/dang-nhap');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <SchedulingSystem />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Lịch hẹn xem phòng | NhaTroVN',
  description: 'Quản lý lịch hẹn xem phòng trọ và căn hộ.',
};
