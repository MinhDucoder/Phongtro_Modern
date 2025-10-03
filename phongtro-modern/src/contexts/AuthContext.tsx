'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiResponse } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  register: (userData: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    role: 'user' | 'landlord' | 'admin';
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const isAuthenticated = !!user;
  
  // Debug logging
  useEffect(() => {
    console.log('🔐 Auth State:', {
      user: user ? { id: user._id, name: user.full_name } : null,
      isAuthenticated,
      isLoading,
      hasCheckedAuth
    });
  }, [user, isAuthenticated, isLoading, hasCheckedAuth]);

  // Handle session expiry
  const { refreshToken } = useTokenRefresh({
    onSessionExpired: async () => {
      console.log('Session expired, clearing user state');
      setUser(null);
      authApi.clearTokens();
    },
    showToast: true
  });

  // Check if user is logged in on app start
  useEffect(() => {
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
      // Thêm delay để đảm bảo localStorage đã sẵn sàng
      setTimeout(() => {
        checkAuthStatus();
      }, 500);
    }
    
    // Auto-refresh user data every 15 minutes if user is logged in
    const refreshInterval = setInterval(() => {
      if (user && hasCheckedAuth) {
        console.log('Auto-refreshing user data...');
        refreshUserSilently();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, [hasCheckedAuth, user]);

  // Additional effect to handle page refresh
  useEffect(() => {
    const handlePageLoad = () => {
      console.log('Page loaded, checking auth status...');
      if (!hasCheckedAuth) {
        setHasCheckedAuth(true);
        checkAuthStatus();
      }
    };

    // Check auth on page load
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        handlePageLoad();
      } else {
        window.addEventListener('load', handlePageLoad);
        return () => window.removeEventListener('load', handlePageLoad);
      }
    }
  }, [hasCheckedAuth]);

  // Check for Google OAuth success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Fetch user info after successful OAuth login
      setTimeout(() => {
        fetchUserProfileSilent();
      }, 1000); // Delay 1 second to ensure tokens are set
    }
  }, []);

  // Fallback: Check if user has valid token but no user data
  useEffect(() => {
    const checkToken = () => {
      const tokenStatus = authApi.getTokenStatus();
      
      if (tokenStatus.hasToken && !tokenStatus.isExpired && !user && !isLoading) {
        console.log('Found valid token but no user data, fetching user profile...');
        fetchUserProfileSilent();
      }
    };

    // Check after 2 seconds
    setTimeout(checkToken, 2000);
  }, [user, isLoading]);

  const handleMeResponse = (response: ApiResponse) => {
    if (response.success !== false && response) {
      // getProfile() trả về user data trực tiếp, không wrap trong response.user
      const userData = response.data || response;
      setUser(userData as User);
    } else {
      setUser(null);

      if (response.message?.includes('Phiên làm việc đã hết hạn')) {
        authApi.clearTokens();
      }
    }
  };

  // Lắng nghe sự kiện cập nhật hồ sơ/ảnh đại diện để refresh user toàn app
  useEffect(() => {
    const onProfileUpdated = () => {
      refreshUserSilently();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', onProfileUpdated as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile-updated', onProfileUpdated as EventListener);
      }
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getProfile();
      handleMeResponse(response);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfileSilent = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have valid tokens before making the request
      const tokenStatus = authApi.getTokenStatus();
      if (!tokenStatus.hasToken) {
        console.log('No token available, skipping silent fetch');
        setUser(null);
        return;
      }
      
      if (tokenStatus.isExpired) {
        console.log('Token expired, attempting refresh before fetch...');
        try {
          await refreshToken();
        } catch (refreshError) {
          console.log('Token refresh failed in silent fetch:', refreshError);
          setUser(null);
          return;
        }
      }
      
      console.log('Fetching user profile silently...');
      const response = await authApi.getProfile();
      console.log('Profile response:', response);
      handleMeResponse(response);
    } catch (error) {
      console.log('Silent fetch failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 Checking auth status...');
      
      // Check token status first
      const tokenStatus = authApi.getTokenStatus();
      console.log('Token status:', tokenStatus);
      
      if (!tokenStatus.hasToken) {
        console.log('No token found, user not authenticated');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (tokenStatus.isExpired) {
        console.log('Token expired, attempting refresh...');
        try {
          await refreshToken();
          // After refresh, try to get user profile
          await fetchUserProfileSilent();
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError);
          setUser(null);
          setIsLoading(false);
          return;
        }
      } else {
        console.log('Token valid, fetching user profile...');
        // Try to get user info from server
        await fetchUserProfileSilent();
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      // Clear user state if authentication fails
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      setIsLoading(true);
      const response: ApiResponse = await authApi.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        toastManager.showLoginSuccess(response.user.full_name);
        
        return { success: true, user: response.user };
      }
      
      // Server trả về thất bại nhưng không có thông báo lỗi
      toastManager.showLoginError(response.message || 'Đăng nhập không thành công');
      return { success: false };
    } catch (error) {
      // Xử lý các lỗi từ API
      let errorMessage = 'Không thể đăng nhập vào hệ thống, vui lòng thử lại';
      
      if (error instanceof Error) {
        // Xử lý thông báo lỗi thân thiện
        if (error.message.includes('Email hoặc mật khẩu không chính xác') ||
            error.message.includes('Thông tin đăng nhập không chính xác')) {
          errorMessage = 'Email hoặc mật khẩu không chính xác';
        } else if (error.message.includes('kết nối') || error.message.includes('mạng')) {
          errorMessage = 'Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toastManager.showLoginError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    role: 'user' | 'landlord' | 'admin';
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: ApiResponse = await authApi.register(userData);
      
      toastManager.showSuccess(response.message || 'Đăng ký thành công!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký';
      toastManager.showError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call API logout (this will also clear tokens)
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Clear tokens manually if API fails
      authApi.clearTokens();
    } finally {
      // Clear local state
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      await fetchUserProfile();
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const refreshUserSilently = async (): Promise<void> => {
    try {
      await fetchUserProfileSilent();
    } catch (error) {
      console.error('Error silently refreshing user:', error);
      // Don't clear user on silent refresh failure
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

