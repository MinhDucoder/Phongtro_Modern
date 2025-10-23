import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Để xử lý cookie giữa frontend và backend
});

// Không gắn Authorization từ localStorage nữa.
// Cookie HttpOnly sẽ được gửi tự động do withCredentials: true

// Giữ nguyên xử lý response mặc định của axios

export default api;