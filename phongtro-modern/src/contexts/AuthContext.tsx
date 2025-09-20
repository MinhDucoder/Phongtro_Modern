'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiResponse } from '@/lib/api';
import toast from 'react-hot-toast';

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
  }, [hasCheckedAuth]);

  // Check for Google OAuth success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('URL params:', window.location.search);
    if (urlParams.get('login') === 'success') {
      console.log('Detected login=success, fetching user profile...');
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch user info after successful OAuth login
      setTimeout(() => {
        fetchUserProfile();
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
        console.log('Found accessToken cookie but no user data, fetching profile...');
        fetchUserProfile();
      }
    };

    // Check after 2 seconds
    setTimeout(checkCookie, 2000);
  }, [user, isLoading]);

  const fetchUserProfile = async () => {
    try {
      console.log('fetchUserProfile: Starting...');
      setIsLoading(true);
      console.log('fetchUserProfile: Calling API /me...');
      const response = await authApi.getMe();
      console.log('fetchUserProfile: API response:', response);
      // API /me trả về user trong response.user
      if (response.success && response.user) {
        setUser(response.user as User);
        toast.success('Đăng nhập thành công!');
      } else {
        console.log('fetchUserProfile: No user in response', response);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't show error toast for profile fetch failures
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Try to get user info from server using httpOnly cookie
      await fetchUserProfile();
    } catch (error) {
      console.error('Error checking auth status:', error);
      
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      setIsLoading(true);
      const response: ApiResponse = await authApi.login({ email, password });
      
      console.log('Login response:', response); // Debug log
      
      if (response.success && response.user) {
        setUser(response.user);
        
        toast.success(response.message || 'Đăng nhập thành công!');
        return { success: true, user: response.user };
      }
      
      toast.error(response.message || 'Đăng nhập thất bại');
      return { success: false };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng nhập';
      toast.error(errorMessage);
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
      
      toast.success(response.message || 'Đăng ký thành công!', { duration: 200 });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký';
      toast.error(errorMessage, { duration: 200 });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Vẫn logout local dù API có lỗi
    } finally {
     
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
