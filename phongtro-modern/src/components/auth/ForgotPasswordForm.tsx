'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toastManager } from '@/components/ui/ToastManager';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Vui lòng nhập email';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Email không hợp lệ';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (touched) {
      const error = validateEmail(newEmail);
      setErrors({ email: error });
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const error = validateEmail(email);
    setErrors({ email: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      setTouched(true);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending forgot password request for email:', email);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setIsSubmitted(true);
        toastManager.showSuccess('Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
      } else {
        toastManager.showError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toastManager.showError('Có lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg 
              className="h-6 w-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Email đã được gửi!
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong>{email}</strong>.
            Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và làm theo hướng dẫn.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Gửi lại email
            </button>
            <button
              onClick={() => router.push('/dang-nhap')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Địa chỉ email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 ${
                touched && errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Nhập địa chỉ email của bạn"
            />
            {touched && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu đến email này
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang gửi email...
              </div>
            ) : (
              'Gửi email đặt lại mật khẩu'
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Nhớ ra mật khẩu?{' '}
            <button
              type="button"
              onClick={() => router.push('/dang-nhap')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Quay lại đăng nhập
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}