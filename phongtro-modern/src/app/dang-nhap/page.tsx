import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Đăng nhập vào tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <a href="/dang-ky" className="font-medium text-blue-600 hover:text-blue-500">
            tạo tài khoản mới
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm type="login" />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Đăng nhập | Phongtro123.com',
  description: 'Đăng nhập vào tài khoản Phongtro123.com để đăng tin cho thuê phòng trọ và quản lý tin đăng.',
};
