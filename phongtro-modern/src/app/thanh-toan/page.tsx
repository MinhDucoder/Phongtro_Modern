import PaymentPage from '@/components/payment/PaymentPage';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

export default function Payment() {
  return (
    <AuthRequired>
      <PaymentPage />
    </AuthRequired>
  );
}
