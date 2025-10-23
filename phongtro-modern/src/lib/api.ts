// API cấu hình và service layer
export const API_BASE_URL = 'http://localhost:5000/api/v1';

// CSRF token (lazy-initialized)
let csrfToken: string | null = null;

async function ensureCsrfToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (data && data.success && data.csrfToken) {
      csrfToken = data.csrfToken as string;
      return csrfToken;
    }
  } catch (_) {
    // ignore
  }
  return '';
}

// Token management
interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class TokenManager {
  private static instance: TokenManager;
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private constructor() {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Cookie-based auth: không tải token từ localStorage
      this.tokenData = null;
    } catch (error) {
      this.tokenData = null;
    }
  }

  private saveTokenToStorage(tokenData: TokenData): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Cookie-based auth: không lưu token vào localStorage
      this.tokenData = tokenData;
    } catch (error) {
      // ignore
    }
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number = 3600): void {
    // Cookie-based auth: token do server set qua HttpOnly cookie; không lưu client-side
    this.tokenData = null;
  }

  getAccessToken(): string | null {
    // Không dùng Authorization header, để server đọc từ cookie
    return null;
  }

  getRefreshToken(): string | null {
    // Refresh token chỉ ở HttpOnly cookie
    return null;
  }

  isTokenExpired(): boolean {
    // Không kiểm tra client-side, để server xử lý
    return false;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      // Clear cookies fallback (client-side)
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    this.tokenData = null;
    this.refreshPromise = null;
  }

  async refreshAccessToken(): Promise<string> {
    // If already refreshing, wait for the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Cookie-based refresh: không cần truyền refreshToken trong body
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      // Lấy CSRF token và gửi kèm trong header để vượt verifyCsrf ở BE
      const csrf = await ensureCsrfToken();
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        // Không đặt Content-Type để tránh preflight không cần thiết
        credentials: 'include',
        headers: csrf ? { 'X-CSRF-Token': csrf } : undefined,
        // Refresh token ở HttpOnly cookie, không gửi body
      });

      if (!response.ok) {
        // Nếu refresh token hết hạn hoặc không hợp lệ, xóa tokens và không log error
        if (response.status === 401 || response.status === 403) {
          this.clearTokens();
          // Redirect to login nếu đang ở trang yêu cầu auth
          if (typeof window !== 'undefined' && 
              (window.location.pathname.startsWith('/dashboard') || 
               window.location.pathname.startsWith('/profile'))) {
            window.location.href = '/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname);
          }
          throw new Error('Session expired');
        }
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.success && data.accessToken) {
        return data.accessToken;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      // Chỉ log error nếu không phải lỗi session expired
      if (error instanceof Error && error.message !== 'Session expired') {
        console.error('Token refresh error:', error);
      }
      this.clearTokens();
      throw error;
    }
  }
}

const tokenManager = TokenManager.getInstance();

// Các kiểu dữ liệu cho API responses
export interface ApiResponse<T = any> {
  success?: boolean;
  message: string;
  data?: T;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'landlord' | 'admin';
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  avatar?: string | { url: string; public_id: string };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'user' | 'landlord' | 'admin';
}

export interface Room {
  _id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  city: string;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  coordinate?: {
    lat: number;
    lng: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  // Optional fields that might come from post
  postId?: string;
  status?: string;
  favouriteLevel?: string;
  options?: string[];
  contact?: {
    name: string;
    phone: string;
    email: string;
    isVerified: boolean;
  };
}

export interface Post {
  _id: string;
  id: string;
  status: 'pending' | 'active' | 'expired' | 'rejected' | 'paused';
  favouriteLevel: 'free' | 'silver' | 'gold' | 'platinum';
  options: string[];
  createdAt: string;
  updatedAt: string;
  roomId: {
    _id: string;
    id: string;
    title: string;
    description: string;
    price: number;
    area: number;
    address: string;
    city: string;
    images: string[];
    amenities: string[];
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  landlord: {
    _id: string;
    id: string;
    full_name: string;
    phone: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  contact: {
    name: string;
    phone: string;
    email: string;
    isVerified: boolean;
  } | null;
  analytics?: {
    views: number;
    likes: number;
    calls: number;
    messages: number;
  };
  viewCount?: number;
}

// Hàm gửi request API tổng quát với automatic token refresh
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<ApiResponse<T>> {
  // Loại bỏ tham số _t nếu có (tránh tạo URL khác nhau vô ích)
  const normEndpoint = endpoint.replace(/([?&])_t=\d+(&|$)/, (m, p1, p2) => (p2 ? p1 : ''))
                               .replace(/[?&]$/, '');
  const url = `${API_BASE_URL}${normEndpoint}`;
  
  // Get access token
  let accessToken = tokenManager.getAccessToken();
  
  // If token is expired, try to refresh it (except for auth endpoints)
  if (accessToken && tokenManager.isTokenExpired() && 
      !endpoint.includes('/auth/')) {
    try {
      // Check if we have a refresh token before attempting refresh
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        console.log('No refresh token available, clearing tokens');
        tokenManager.clearTokens();
        accessToken = null;
      } else {
        accessToken = await tokenManager.refreshAccessToken();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and let the request proceed (will likely get 401)
      tokenManager.clearTokens();
      accessToken = null;
    }
  }
  
  // Check if body is FormData
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions: RequestInit = {
    headers: {
      // Only set Content-Type for JSON, let browser set it for FormData
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      // Add cache control for login requests
      ...(endpoint.includes('/auth/login') ? { 'Cache-Control': 'no-cache' } : {})
    },
    credentials: 'include', // Bao gồm cookies cho authentication
    // Add mode for CORS handling
    mode: 'cors',
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Dedupe requests: tránh gửi trùng cùng URL+method trong thời gian ngắn
  // (đơn giản: Abort nếu đã có request y hệt đang pending)
  const dedupeKey = `${(config.method || 'GET').toString().toUpperCase()} ${url}`;
  const globalAny = globalThis as any;
  globalAny.__pendingRequests = globalAny.__pendingRequests || new Map<string, AbortController>();
  let controller = new AbortController();
  if (globalAny.__pendingRequests.has(dedupeKey)) {
    // Huỷ request cũ và thay bằng request mới
    try { globalAny.__pendingRequests.get(dedupeKey)!.abort(); } catch {}
    globalAny.__pendingRequests.delete(dedupeKey);
  }
  globalAny.__pendingRequests.set(dedupeKey, controller);

  try {
    // CSRF header for state-changing requests
    const method = (config.method || 'GET').toString().toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isAuthMutation = endpoint.startsWith('/auth/') || isStateChanging;
    if (isAuthMutation && !isFormData) {
      const token = await ensureCsrfToken();
      if (token) {
        (config.headers as Record<string, string>)['X-CSRF-Token'] = token;
      }
    }

    // Add timeout - increased to 30 seconds for login requests
    const isDashboard = endpoint.startsWith('/dashboard/');
    const timeoutDuration = endpoint.includes('/auth/login') ? 30000 : (isDashboard ? 30000 : 20000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    // Remove from pending map
    globalAny.__pendingRequests.delete(dedupeKey);
    
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      try {
        // Thử parse JSON nếu response là json
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
      } catch (e) {
        const errorText = await response.text();
        errorData = { message: errorText };
      }
      
      // Chỉ hiển thị các lỗi không phải 401 trên console để tránh ồn ào log
      if (response.status !== 401) {
        console.warn(`API Response (${response.status}):`, errorData);
      }
      
      // Handle specific error cases
      if (response.status === 401) {
        const isAuthEndpoint = endpoint === '/auth/login' || endpoint.includes('/auth/register');
        const isRefreshEndpoint = endpoint === '/auth/refresh-token';
        
        // If this is not an auth endpoint and we haven't retried yet, try token refresh
        if (!isAuthEndpoint && !isRefreshEndpoint && retryCount === 0) {
          try {
            await tokenManager.refreshAccessToken();
            // Retry the original request with new token
            return apiRequest<T>(endpoint, options, retryCount + 1);
          } catch (refreshError) {
            // Token refresh failed, silently clear tokens
            tokenManager.clearTokens();
            // Fall through to show error
          }
        }
        
        // Clear tokens for any 401 error
        tokenManager.clearTokens();
        
        // Notify about session expiry (except for auth endpoints)
        if (!isAuthEndpoint && typeof window !== 'undefined') {
          // Dispatch custom event for session expiry
          window.dispatchEvent(new CustomEvent('session-expired', {
            detail: { endpoint, retryCount }
          }));
        }
        
        // Tạo thông báo lỗi thân thiện hơn cho 401
        let friendlyMessage;
        if (errorData?.message && errorData.message.includes('Email hoặc mật khẩu không chính xác')) {
          friendlyMessage = "Email hoặc mật khẩu không chính xác";
        } else if (endpoint === '/auth/login') {
          friendlyMessage = "Thông tin đăng nhập không chính xác";
        } else if (isRefreshEndpoint) {
          friendlyMessage = "Phiên đăng nhập đã hết hạn";
        } else {
          friendlyMessage = "Phiên làm việc đã hết hạn, vui lòng đăng nhập lại";
        }
        
        throw new Error(friendlyMessage);
      }
      
      // Tạo thông báo thân thiện cho các lỗi khác
      let friendlyMessage = errorData?.message || "Có lỗi xảy ra, vui lòng thử lại sau";
      
      // Thông báo thân thiện dựa trên status code
      switch (response.status) {
        case 400:
          // Cố gắng trích xuất thông báo lỗi cụ thể
          if (errorData?.message) {
            if (errorData.message.includes('email')) {
              friendlyMessage = "Email không hợp lệ hoặc đã tồn tại trong hệ thống";
            } else if (errorData.message.includes('password')) {
              friendlyMessage = "Mật khẩu không đáp ứng yêu cầu bảo mật";
            } else {
              friendlyMessage = errorData.message;
            }
          } else {
            friendlyMessage = "Thông tin không hợp lệ, vui lòng kiểm tra lại";
          }
          break;
        case 403:
          // Xác định rõ nguyên nhân của lỗi 403 (quyền truy cập)
          if (endpoint.includes('/dashboard')) {
            friendlyMessage = "Bạn không có quyền truy cập vào tính năng của chủ nhà. Vui lòng nâng cấp tài khoản lên landlord";
          } else if (endpoint.includes('/admin')) {
            friendlyMessage = "Tính năng này chỉ dành cho quản trị viên hệ thống";
          } else {
            friendlyMessage = errorData?.message || "Bạn không có quyền truy cập vào tính năng này";
          }
          break;
        case 404:
          friendlyMessage = errorData?.message || "Không tìm thấy thông tin yêu cầu";
          break;
        case 500:
          friendlyMessage = "Hệ thống đang gặp sự cố. Vui lòng thử lại sau";
          break;
        case 503:
          friendlyMessage = "Dịch vụ hiện đang bảo trì, vui lòng thử lại sau";
          break;
      }
      
      throw new Error(friendlyMessage);
    }
    
    // Check if response is JSON (skip for FormData requests)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (isFormData) {
        // For FormData requests, try to parse as JSON but don't fail if it's not JSON
        try {
          const data = await response.json();
          return data;
        } catch (e) {
          // If JSON parsing fails, return the text response
          const text = await response.text();
          return { success: true, message: text };
        }
      } else {
        console.error('Non-JSON response received:', {
          status: response.status,
          contentType,
          url: url
        });
        throw new Error(`Server returned non-JSON response (${response.status})`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Remove from pending map on error
    const globalAny = globalThis as any;
    if (globalAny.__pendingRequests) {
      globalAny.__pendingRequests.delete(dedupeKey);
    }
    // Xử lý lỗi timeout: retry 1 lần cho GET/idempotent
    const isGet = (options.method || defaultOptions.method || 'GET').toString().toUpperCase() === 'GET';
    const timeoutDuration = endpoint.includes('/auth/login') ? 30000 : (endpoint.startsWith('/dashboard/') ? 30000 : 20000);
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('API request timeout:', url, 'Timeout duration:', timeoutDuration + 'ms');
      if (!endpoint.includes('/auth/login') && isGet && retryCount === 0) {
        // small backoff then retry once
        await new Promise((r) => setTimeout(r, 250));
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }
      if (endpoint.includes('/auth/login')) {
        throw new Error('Đăng nhập mất quá nhiều thời gian. Vui lòng kiểm tra kết nối mạng và thử lại');
      }
      throw new Error('Kết nối đến máy chủ bị gián đoạn, vui lòng thử lại');
    }
    
    // Xử lý lỗi mạng
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('Network error:', url, 'Error details:', error.message);
      if (endpoint.includes('/auth/login')) {
        throw new Error('Không thể kết nối đến máy chủ đăng nhập. Vui lòng kiểm tra kết nối mạng');
      }
      throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng');
    }
    
    // Các lỗi đã được xử lý trước đó
    if (error instanceof Error) {
      throw error;
    }
    
    // Lỗi không xác định
    console.error('Unhandled API error:', error, 'URL:', url);
    throw new Error('Có lỗi xảy ra khi kết nối với server');
  }
}

// Các hàm API cho Authentication
export const authApi = {
  // Đăng nhập user
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    console.log('🔐 Starting login request for:', credentials.email);
    const startTime = Date.now();
    
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      const duration = Date.now() - startTime;
      console.log('🔐 Login request completed in:', duration + 'ms');
      
      // Save tokens on successful login
      if (response.success !== false && response.token) {
        const refreshToken = response.refreshToken || response.token;
        const expiresIn = response.expiresIn || 3600;
        tokenManager.setTokens(response.token, refreshToken, expiresIn);
        console.log('🔐 Tokens saved successfully');
      }
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('🔐 Login request failed after:', duration + 'ms', error);
      throw error;
    }
  },

  // Đăng ký user
  async register(userData: RegisterRequest): Promise<ApiResponse> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Đăng xuất user
  async logout(): Promise<ApiResponse> {
    try {
      const response = await apiRequest('/auth/logout', {
        method: 'POST',
      });
      
      // Clear tokens regardless of response
      tokenManager.clearTokens();
      
      return response;
    } catch (error) {
      // Clear tokens even if logout API fails
      tokenManager.clearTokens();
      throw error;
    }
  },

  // Xác thực email
  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiRequest(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  },

  // Làm mới token (public method for manual refresh)
  async refreshToken(): Promise<ApiResponse> {
    try {
      const newToken = await tokenManager.refreshAccessToken();
      return {
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  },

  // Lấy thông tin profile của user hiện tại
  async getProfile(): Promise<ApiResponse> {
    console.log('getProfile: API_BASE_URL =', API_BASE_URL);
    console.log('getProfile: Full URL =', `${API_BASE_URL}/user/profile`);
    return apiRequest('/user/profile', {
      method: 'GET',
    });
  },

  // Lấy thông tin user cơ bản (bao gồm avatar) từ /user/me
  async getMe(): Promise<ApiResponse> {
    console.log('getMe: API_BASE_URL =', API_BASE_URL);
    console.log('getMe: Full URL =', `${API_BASE_URL}/user/me`);
    return apiRequest('/user/me', {
      method: 'GET',
    });
  },

  // Cập nhật thông tin profile
  async updateProfile(profileData: {
    full_name?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
  }): Promise<ApiResponse> {
    return apiRequest('/user/update', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Upload avatar
  async uploadAvatar(formData: FormData): Promise<ApiResponse> {
    return apiRequest('/user/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
    });
  },

  // Remove avatar
  async removeAvatar(): Promise<ApiResponse> {
    return apiRequest('/user/avatar', {
      method: 'DELETE',
    });
  },

  // (removed duplicate getMe)
  
  // Get current token status
  getTokenStatus(): { hasToken: boolean; isExpired: boolean; expiresIn?: number } {
    if (typeof document !== 'undefined') {
      const hasCookieToken = document.cookie.split('; ').some((c) => c.startsWith('accessToken='));
      return {
        hasToken: hasCookieToken,
        isExpired: false,
      };
    }
    const hasToken = false;
    const isExpired = false;
    
    return {
      hasToken,
      isExpired,
      // Could add expiresIn calculation here if needed
    };
  },
  
  // Clear tokens manually (useful for testing)
  clearTokens(): void {
    tokenManager.clearTokens();
  },
  
  // Đổi mật khẩu
  async changePassword(payload: { oldPassword: string; newPassword: string }): Promise<ApiResponse> {
    return apiRequest('/user/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

// Các hàm API cho Room
export const roomApi = {
  // Lấy tất cả phòng
  async getRooms(params?: {
    city?: string;
    price_min?: number;
    price_max?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/rooms${queryString}`, {
      method: 'GET',
    });
  },

  // Lấy phòng theo ID
  async getRoomById(id: string): Promise<ApiResponse> {
    return apiRequest(`/rooms/${id}`, {
      method: 'GET',
    });
  },

  // Tạo phòng mới
  async createRoom(roomData: any): Promise<ApiResponse> {
    // Nếu roomData là FormData thì gửi trực tiếp, không stringify
    if (roomData instanceof FormData) {
      return apiRequest('/rooms/create', {
        method: 'POST',
        body: roomData, // Không stringify FormData
      });
    }
    
    return apiRequest('/rooms/create', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  // Cập nhật phòng
  async updateRoom(id: string, roomData: any): Promise<ApiResponse> {
    return apiRequest(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  // Xóa phòng
  async deleteRoom(id: string): Promise<ApiResponse> {
    return apiRequest(`/rooms/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API cho landlord
export const dashboardApi = {
  // Get dashboard overview
  async getOverview(): Promise<ApiResponse> {
    try {
      return await apiRequest('/dashboard/overview', {
        method: 'GET',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("không có quyền truy cập")) {
        // Trả về response thất bại với thông báo lỗi cụ thể về quyền truy cập
        return {
          success: false,
          message: "Bạn cần có tài khoản chủ nhà (landlord) để truy cập tính năng này",
          error: "PERMISSION_DENIED"
        };
      }
      throw error; // Re-throw lỗi nếu không phải lỗi quyền truy cập
    }
  },

  // Get landlord's posts
  async getMyPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/dashboard/posts${queryString}`, {
      method: 'GET',
    });
  },

  // Get post by ID for editing
  async getPostById(postId: string): Promise<ApiResponse> {
    return apiRequest(`/dashboard/posts/${postId}`, {
      method: 'GET',
    });
  },

  // Create new post
  async createPost(postData: any): Promise<ApiResponse> {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Update post
  async updatePost(postId: string, postData: any): Promise<ApiResponse> {
    return apiRequest(`/dashboard/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  // Delete post
  async deletePost(postId: string): Promise<ApiResponse> {
    return apiRequest(`/dashboard/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Renew post
  async renewPost(postId: string): Promise<ApiResponse> {
    return apiRequest(`/dashboard/posts/${postId}/renew`, {
      method: 'PATCH',
    });
  },

  // Get analytics
  async getAnalytics(params?: {
    timeRange?: string;
    postId?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/dashboard/analytics${queryString}`, {
      method: 'GET',
    });
  },

  // Get recent activities
  async getRecentActivities(limit?: number): Promise<ApiResponse> {
    const queryString = limit ? `?limit=${limit}` : '';
    return apiRequest(`/dashboard/activities${queryString}`, {
      method: 'GET',
    });
  },

  // Note: getPostById, createPost, updatePost, deletePost are already defined above
  // Removed duplicate definitions to fix linter errors

  // Get quick stats for widgets
  async getQuickStats(): Promise<ApiResponse> {
    return apiRequest('/dashboard/quick-stats', {
      method: 'GET',
    });
  },

  // Get user subscription info
  async getSubscriptionInfo(): Promise<ApiResponse> {
    return apiRequest('/posts/subscription-info', {
      method: 'GET',
    });
  },
};

// Rental Request API
export const rentalRequestApi = {
  // Create rental request (tenant)
  async createRequest(requestData: {
    postId: string;
    message: string;
    expectedMoveIn: string;
    contactInfo?: any;
    tenantInfo?: any;
  }): Promise<ApiResponse> {
    return apiRequest('/rental-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Get landlord's requests
  async getLandlordRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/rental-requests/landlord/requests${queryString}`, {
      method: 'GET',
    });
  },

  // Get request statistics
  async getRequestStats(): Promise<ApiResponse> {
    return apiRequest('/rental-requests/landlord/stats', {
      method: 'GET',
    });
  },

  // Update request status
  async updateRequestStatus(requestId: string, status: string, responseMessage?: string): Promise<ApiResponse> {
    return apiRequest(`/rental-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseMessage }),
    });
  },

  // Get request detail
  async getRequestDetail(requestId: string): Promise<ApiResponse> {
    return apiRequest(`/rental-requests/${requestId}`, {
      method: 'GET',
    });
  },

  // Get tenant's requests
  async getTenantRequests(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/rental-requests/my-requests${queryString}`, {
      method: 'GET',
    });
  },
};

// Payment API
export const paymentApi = {
  // Get payment history
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    packageType?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/payments/dashboard/history${queryString}`, {
      method: 'GET',
    });
  },

  // Get payment statistics
  async getPaymentStats(): Promise<ApiResponse> {
    return apiRequest('/payments/dashboard/stats', {
      method: 'GET',
    });
  },

  // Get payment detail
  async getPaymentDetail(paymentId: string): Promise<ApiResponse> {
    return apiRequest(`/payments/dashboard/${paymentId}`, {
      method: 'GET',
    });
  },

  // Download invoice
  async downloadInvoice(paymentId: string): Promise<ApiResponse> {
    return apiRequest(`/payments/dashboard/${paymentId}/invoice`, {
      method: 'GET',
    });
  },
};

// Saved Properties API
export const savedPropertiesApi = {
  // Get saved properties
  async getSavedProperties(params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
    sortBy?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/saved-properties/dashboard/saved${queryString}`, {
      method: 'GET',
    });
  },

  // Get saved properties statistics
  async getSavedPropertiesStats(): Promise<ApiResponse> {
    return apiRequest('/saved-properties/dashboard/saved/stats', {
      method: 'GET',
    });
  },

  // Save a property
  async saveProperty(postId: string, notes?: string, tags?: string[]): Promise<ApiResponse> {
    return apiRequest('/saved-properties', {
      method: 'POST',
      body: JSON.stringify({ postId, notes, tags }),
    });
  },

  // Remove a saved property
  async removeProperty(favoriteId: string): Promise<ApiResponse> {
    return apiRequest(`/saved-properties/${favoriteId}`, {
      method: 'DELETE',
    });
  },

  // Update favorite notes and tags
  async updateFavorite(favoriteId: string, notes?: string, tags?: string[]): Promise<ApiResponse> {
    return apiRequest(`/saved-properties/${favoriteId}`, {
      method: 'PUT',
      body: JSON.stringify({ notes, tags }),
    });
  },

  // Check if a property is saved
  async checkSavedStatus(postId: string): Promise<ApiResponse> {
    return apiRequest(`/saved-properties/dashboard/saved/${postId}`, {
      method: 'GET',
    });
  },
};

export const userSettingsApi = {
  async get(): Promise<ApiResponse> {
    return apiRequest('/user/settings', {
      method: 'GET',
    });
  },

  async update(settings: any): Promise<ApiResponse> {
    return apiRequest('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async updateNotifications(notifications: any): Promise<ApiResponse> {
    return apiRequest('/user/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(notifications),
    });
  },

  async updatePrivacy(privacy: any): Promise<ApiResponse> {
    return apiRequest('/user/settings/privacy', {
      method: 'PUT',
      body: JSON.stringify(privacy),
    });
  },

  async updateSecurity(security: any): Promise<ApiResponse> {
    return apiRequest('/user/settings/security', {
      method: 'PUT',
      body: JSON.stringify(security),
    });
  },

  async updateDisplay(display: any): Promise<ApiResponse> {
    return apiRequest('/user/settings/display', {
      method: 'PUT',
      body: JSON.stringify(display),
    });
  },

  async reset(): Promise<ApiResponse> {
    return apiRequest('/user/settings/reset', {
      method: 'POST',
    });
  },
};

export const subscriptionApi = {
  // Lấy danh sách gói đăng tin
  getPackages: () => apiRequest('/subscriptions/packages'),
  
  // Lấy subscription hiện tại
  getCurrentSubscription: () => apiRequest('/subscriptions/current'),
  
  // Tạo đơn hàng mua gói
  purchasePackage: (data: { packageId: string; paymentMethod: string }) => 
    apiRequest('/subscriptions/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Lấy lịch sử subscription
  getHistory: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/subscriptions/history${queryString}`);
  },

  // Lấy thông tin subscription và lượt đăng tin
  getSubscriptionInfo: () => apiRequest('/posts/subscription-info'),
  
  // Kiểm tra quyền đăng tin
  checkPostPermission: async () => {
    try {
      return await apiRequest('/subscriptions/check-permission');
    } catch (error: any) {
      // Trường hợp đặc biệt: user chưa có subscription
      if (error.message?.includes('chưa có gói đăng tin') || 
          error.message?.includes('không tìm thấy subscription')) {
        return {
          success: false,
          message: error.message,
          data: {
            canPost: false,
            remainingPosts: 0,
            subscription: null
          }
        };
      }
      throw error;
    }
  },
};

export const postPublicApi = {
  async getPostDetail(postId: string): Promise<ApiResponse> {
    return apiRequest(`/posts/${postId}`, {
      method: 'GET',
    });
  },
};

// Statistics API
export const statsApi = {
  // Lấy tổng quan thống kê
  async getOverview(): Promise<ApiResponse> {
    return apiRequest('/stats/overview', {
      method: 'GET',
    });
  },

  // Lấy thống kê real-time
  async getRealTime(): Promise<ApiResponse> {
    return apiRequest('/stats/real-time', {
      method: 'GET',
    });
  },

  // Lấy xu hướng thống kê
  async getTrending(params?: {
    period?: '7d' | '30d';
    limit?: number;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/stats/trending${queryString}`, {
      method: 'GET',
    });
  },

  // Lấy thống kê theo thành phố
  async getCityStats(): Promise<ApiResponse> {
    return apiRequest('/stats/cities', {
      method: 'GET',
    });
  },

  // Lấy thống kê theo loại phòng
  async getPropertyTypeStats(): Promise<ApiResponse> {
    return apiRequest('/stats/property-types', {
      method: 'GET',
    });
  },

  // Lấy thống kê giá thuê
  async getPriceStats(params?: {
    city?: string;
    propertyType?: string;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/stats/prices${queryString}`, {
      method: 'GET',
    });
  },

  // Lấy thống kê người dùng (cần authentication)
  async getUserStats(): Promise<ApiResponse> {
    return apiRequest('/stats/users', {
      method: 'GET',
    });
  },
};

// Notification API
export const notificationApi = {
  // Get all notifications
  async getNotifications(params?: {
    filter?: 'all' | 'unread' | 'important';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    
    return apiRequest(`/notifications${queryString}`, {
      method: 'GET',
    });
  },

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse> {
    return apiRequest('/notifications/unread-count', {
      method: 'GET',
    });
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<ApiResponse> {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all as read
  async markAllAsRead(): Promise<ApiResponse> {
    return apiRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // Delete all notifications
  async deleteAllNotifications(): Promise<ApiResponse> {
    return apiRequest('/notifications', {
      method: 'DELETE',
    });
  },
};

// VIP Post Payment API
export const vipPostPaymentApi = {
  // Lấy danh sách gói VIP
  async getVIPPackages(): Promise<ApiResponse> {
    return apiRequest('/vip-post-payment/packages', {
      method: 'GET',
    });
  },

  // Tạo URL thanh toán VIP
  async createPayment(data: {
    vipPackage: string;
    postData: any;
  }): Promise<ApiResponse> {
    return apiRequest('/vip-post-payment/create-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(paymentId: string): Promise<ApiResponse> {
    return apiRequest(`/vip-post-payment/status/${paymentId}`, {
      method: 'GET',
    });
  },
};

export default {
  auth: authApi,
  rooms: roomApi,
  dashboard: dashboardApi,
  rentalRequests: rentalRequestApi,
  payment: paymentApi,
  savedProperties: savedPropertiesApi,
  userSettings: userSettingsApi,
  subscription: subscriptionApi,
  stats: statsApi,
  notifications: notificationApi,
  vipPostPayment: vipPostPaymentApi,
};
