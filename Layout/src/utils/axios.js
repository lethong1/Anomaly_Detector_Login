import axios from 'axios';

// Hàm lấy CSRF token từ cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Tạo axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm access token và CSRF token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Thêm CSRF token cho POST requests
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch' || config.method === 'delete') {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu response 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Gọi API refresh token
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Lưu access token mới
        localStorage.setItem('accessToken', access);
        
        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Thử lại request gốc
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn, xóa tokens và redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect về login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 