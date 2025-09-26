'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiResponse } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

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

  // Check if user is logged in on app start
  useEffect(() => {
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
      checkAuthStatus();
    }
    
    // Auto-refresh authentication every 10 minutes if user is logged in
    const refreshInterval = setInterval(() => {
      if (user && hasCheckedAuth) {
        console.log('Auto-refreshing authentication...');
        checkAuthStatus();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [hasCheckedAuth, user]);

  // Check for Google OAuth success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Hiển thị thông báo đăng nhập thành công từ OAuth
      showLoginSuccessToast(null); // Không có thông tin user ngay lập tức cho OAuth
      
      // Fetch user info after successful OAuth login
      setTimeout(() => {
        // Gọi phiên bản đặc biệt không hiển thị thông báo
        fetchUserProfileSilent();
      }, 1000); // Delay 1 second to ensure cookie is set
    }
  }, []);

  // Fallback: Check if user is authenticated but no user data
  useEffect(() => {
    const checkCookie = () => {
      // Check if accessToken cookie exists but no user data
      const cookies = document.cookie.split(';');
      const hasAccessToken = cookies.some(cookie => cookie.trim().startsWith('accessToken='));
      
      if (hasAccessToken && !user && !isLoading) {
        // Luôn sử dụng phiên bản im lặng khi tự động kiểm tra đăng nhập
        fetchUserProfileSilent();
      }
    };

    // Check after 2 seconds
    setTimeout(checkCookie, 2000);
  }, [user, isLoading]);

  // Phiên bản chuẩn của fetchUserProfile - sẽ không được sử dụng trực tiếp từ OAuth callbacks
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getMe();
      
      // API /me trả về user trong response.user
      if (response.success && response.user) {
        setUser(response.user as User);
      } else {
        // Không hiển thị lỗi, chỉ xóa trạng thái user
        setUser(null);
        
        // Xóa cookie nếu phát hiện lỗi xác thực
        if (response.message?.includes('Phiên làm việc đã hết hạn')) {
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
    } catch (error) {
      // Xử lý lỗi im lặng, không hiển thị toast
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Phiên bản im lặng - không hiển thị thông báo đăng nhập thành công
  // Được sử dụng cho OAuth callbacks để tránh hiển thị thông báo thành công hai lần
  const fetchUserProfileSilent = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getMe();
      
      if (response.success && response.user) {
        setUser(response.user as User);
      } else {
        setUser(null);
        
        if (response.message?.includes('Phiên làm việc đã hết hạn')) {
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Try to get user info from server using httpOnly cookie
      // Sử dụng phiên bản silent để không hiển thị thông báo
      await fetchUserProfileSilent();
    } catch (error) {
      // Clear user state if authentication fails
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      setIsLoading(true);
      const response: ApiResponse = await authApi.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Không hiển thị toast khi đăng nhập theo yêu cầu
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
      // Không hiển thị toast khi đăng xuất theo yêu cầu
      
      // Gọi API logout
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Vẫn logout local dù API có lỗi
    } finally {
      // Clear local state
      localStorage.removeItem('accessToken');
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
