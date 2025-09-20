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

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Try to get user info from token stored in cookies
      // For now, we'll check if there's a token in localStorage as fallback
      const token = localStorage.getItem('accessToken');
      if (token) {
        // In a real app, you might want to verify the token with the server
        // For now, we'll just check if it exists
        // You can implement a /me endpoint to get current user info
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      setIsLoading(true);
      const response: ApiResponse = await authApi.login({ email, password });
      
      console.log('Login response:', response); // Debug log
      
      if (response.success && response.user) {
        setUser(response.user);
        // Note: We don't need to store token in localStorage anymore as it's handled by httpOnly cookie
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
      // Clear local state regardless of API call success
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      // This would typically call a /me endpoint to get current user info
      // For now, we'll just check if token exists
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
      }
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
