import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Để xử lý cookie giữa frontend và backend
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Bạn có thể thêm logic xử lý trước khi gửi request ở đây
    // Ví dụ: thêm token vào header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Bạn có thể xử lý response trước khi trả về
    return response;
  },
  (error) => {
    // Xử lý các lỗi response
    if (error.response) {
      // Lỗi từ server với status code
      switch (error.response.status) {
        case 401:
          // Xử lý lỗi unauthorized
          break;
        case 403:
          // Xử lý lỗi forbidden
          break;
        case 404:
          // Xử lý lỗi not found
          break;
        default:
          // Xử lý các lỗi khác
          break;
      }
    } else if (error.request) {
      // Lỗi không nhận được response
      console.error('Network Error:', error.request);
    } else {
      // Lỗi khi setup request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;