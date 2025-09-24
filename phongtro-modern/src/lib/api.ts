// API cấu hình và service layer
export const API_BASE_URL = 'http://localhost:5000/api/v1';

// Các kiểu dữ liệu cho API responses
export interface ApiResponse<T = any> {
  success?: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
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
  landlord: {
    _id: string;
    full_name: string;
    role: string;
    phone: string;
    email: string;
  };
  isAvailable: boolean;
  options: string[];
  favouriteLevel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Hàm gửi request API tổng quát
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('apiRequest: Final URL =', url);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Bao gồm cookies cho authentication
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired or invalid - clear any stored auth data
        if (typeof window !== 'undefined') {
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', {
        status: response.status,
        contentType,
        url: url
      });
      throw new Error(`Server returned non-JSON response (${response.status})`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - server không phản hồi');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi kết nối với server');
  }
}

// Các hàm API cho Authentication
export const authApi = {
  // Đăng nhập user
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
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
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Xác thực email
  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiRequest(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  },

  // Làm mới token
  async refreshToken(): Promise<ApiResponse> {
    return apiRequest('/auth/refresh-token', {
      method: 'POST',
    });
  },

  // Lấy thông tin profile của user hiện tại
  async getProfile(): Promise<ApiResponse> {
    console.log('getProfile: API_BASE_URL =', API_BASE_URL);
    console.log('getProfile: Full URL =', `${API_BASE_URL}/user/profile`);
    return apiRequest('/user/profile', {
      method: 'GET',
    });
  },

  // Lấy thông tin user từ JWT token (API /me)
  async getMe(): Promise<ApiResponse> {
    console.log('getMe: API_BASE_URL =', API_BASE_URL);
    console.log('getMe: Full URL =', `${API_BASE_URL}/user/me`);
    return apiRequest('/user/me', {
      method: 'GET',
    });
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
    return apiRequest('/rooms', {
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
    return apiRequest('/dashboard/overview', {
      method: 'GET',
    });
  },

  // Get landlord's posts
  async getMyPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
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

  // Update post status
  async updatePostStatus(postId: string, status: string): Promise<ApiResponse> {
    return apiRequest(`/dashboard/posts/${postId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
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

  // Get single post by ID
  async getPostById(postId: string): Promise<ApiResponse> {
    return apiRequest(`/dashboard/posts/${postId}`, {
      method: 'GET',
    });
  },

  // Create new post
  async createPost(postData: any): Promise<ApiResponse> {
    return apiRequest('/dashboard/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Update existing post
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

export default {
  auth: authApi,
  rooms: roomApi,
  dashboard: dashboardApi,
  rentalRequests: rentalRequestApi,
};
