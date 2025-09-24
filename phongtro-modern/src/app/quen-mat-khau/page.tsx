import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Quên mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          <a href="/dang-nhap" className="font-medium text-blue-600 hover:text-blue-500">
            Quay lại đăng nhập
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Quên mật khẩu | PhongTroVN',
  description: 'Đặt lại mật khẩu cho tài khoản PhongTroVN của bạn.',
};