import YeuCauDaGuiClient from './YeuCauDaGuiClient';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

export const metadata = {
  title: 'Yêu cầu thuê phòng đã gửi | NhaTroVN',
  description: 'Theo dõi trạng thái yêu cầu thuê phòng của bạn.',
};

export default function YeuCauDaGuiPage() {
  return (
    <AuthRequired>
      <YeuCauDaGuiClient />
    </AuthRequired>
  );
}