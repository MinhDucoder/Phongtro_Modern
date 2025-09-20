'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState({
    isLoading: true,
    success: false,
    message: '',
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/api/v1/auth/verify-email?token=${token}`);
        setVerificationStatus({
          isLoading: false,
          success: true,
          message: response.data.message || 'Xác thực email thành công!',
        });
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationStatus({
          isLoading: false,
          success: false,
          message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xác thực email',
        });
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus({
        isLoading: false,
        success: false,
        message: 'Token xác thực không hợp lệ',
      });
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {verificationStatus.isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mx-auto"></div>
          </div>
        ) : verificationStatus.success ? (
          <>
            <div className="text-green-500 mb-4">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác thực thành công!</h2>
            <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
            <Link
              href="/dang-nhap"
              className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </>
        ) : (
          <>
            <div className="text-red-500 mb-4">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác thực thất bại</h2>
            <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              Thử lại
            </button>
            <Link
              href="/dang-ky"
              className="inline-block bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại đăng ký
            </Link>
          </>
        )}
      </div>
    </div>
  );
}