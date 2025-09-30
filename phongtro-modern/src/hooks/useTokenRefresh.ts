'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

interface UseTokenRefreshOptions {
  onSessionExpired?: () => void;
  redirectTo?: string;
  showToast?: boolean;
}

export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    onSessionExpired,
    redirectTo = '/dang-nhap',
    showToast = true
  } = options;
  
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isHandlingExpiry = useRef(false);

  const handleSessionExpired = useCallback(async () => {
    // Prevent multiple simultaneous handling
    if (isHandlingExpiry.current) return;
    isHandlingExpiry.current = true;

    try {
      console.log('Handling session expiry...');
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Show toast notification
      if (showToast) {
        toastManager.showWarning('Phiên đăng nhập đã hết hạn', {
          description: 'Vui lòng đăng nhập lại để tiếp tục',
          duration: 5000
        });
      }

      // Call custom handler if provided
      if (onSessionExpired) {
        await onSessionExpired();
      }

      // Delay redirect to allow toast to show
      timeoutRef.current = setTimeout(() => {
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectUrl);
      }, 1500);

    } finally {
      // Reset flag after a delay to prevent rapid retriggering
      setTimeout(() => {
        isHandlingExpiry.current = false;
      }, 3000);
    }
  }, [onSessionExpired, redirectTo, showToast, router]);

  // Listen for session expiry events
  useEffect(() => {
    const handleSessionExpiredEvent = (event: CustomEvent) => {
      console.log('Session expired event received:', event.detail);
      handleSessionExpired();
    };

    // Add event listener for session expiry
    window.addEventListener('session-expired', handleSessionExpiredEvent as EventListener);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpiredEvent as EventListener);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleSessionExpired]);

  // Check token status periodically
  useEffect(() => {
    const checkTokenStatus = () => {
      const tokenStatus = authApi.getTokenStatus();
      
      if (tokenStatus.hasToken && tokenStatus.isExpired) {
        console.log('Token expired detected during periodic check');
        handleSessionExpired();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenStatus, 5 * 60 * 1000);

    // Initial check
    checkTokenStatus();

    return () => clearInterval(interval);
  }, [handleSessionExpired]);

  // Provide manual refresh method
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken();
      return response.success !== false;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      return false;
    }
  }, []);

  return {
    refreshToken,
    handleSessionExpired
  };
}
