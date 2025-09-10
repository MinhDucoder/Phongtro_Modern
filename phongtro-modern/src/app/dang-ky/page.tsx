import AuthForm from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="/dang-nhap" className="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập ngay
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm type="register" />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Đăng ký | Phongtro123.com',
  description: 'Tạo tài khoản Phongtro123.com để đăng tin cho thuê phòng trọ miễn phí và quản lý tin đăng dễ dàng.',
};
