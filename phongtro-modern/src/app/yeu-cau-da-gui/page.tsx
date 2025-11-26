import YeuCauDaGuiClient from './YeuCauDaGuiClient';
import { Suspense } from 'react';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

export const metadata = {
  title: 'Yêu cầu thuê phòng đã gửi | NhaTroVN',
  description: 'Theo dõi trạng thái yêu cầu thuê phòng của bạn.',
};

export default function YeuCauDaGuiPage() {
  return (
    <AuthRequired>
      <Suspense fallback={null}>
        <YeuCauDaGuiClient />
      </Suspense>
    </AuthRequired>
  );
}