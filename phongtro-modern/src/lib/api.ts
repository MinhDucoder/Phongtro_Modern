// API cấu hình và service layer
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Các kiểu dữ liệu cho API responses
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  token?: string;
  user?: User;
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

// Hàm gửi request API tổng quát
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Có lỗi xảy ra');
    }

    return data;
  } catch (error) {
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
};

// Các hàm API cho Room (sử dụng trong tương lai)
export const roomApi = {
  // Lấy tất cả phòng
  async getRooms(params?: Record<string, any>): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
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
