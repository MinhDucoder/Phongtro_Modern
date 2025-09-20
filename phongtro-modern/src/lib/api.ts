// API cấu hình và service layer
const API_BASE_URL = 'http://localhost:5000/api/v1';

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
      throw new Error(`HTTP ${response.status}: ${errorText}`);
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

export default {
  auth: authApi,
  rooms: roomApi,
};
