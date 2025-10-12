'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthRequired } from '@/components/auth/ProtectedRoute';

export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile notifications tab
    router.replace('/profile?tab=notifications');
  }, [router]);

  return (
    <AuthRequired>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    </AuthRequired>
  );
}

