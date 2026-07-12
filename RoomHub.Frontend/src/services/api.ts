import axios from 'axios';

const API_BASE_URL = 'http://localhost:5143/api';
export const API_ORIGIN = new URL(API_BASE_URL).origin;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g. token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const email = localStorage.getItem('userEmail');
        
        if (refreshToken && email) {
          // Attempt token refresh via API endpoint if we add it, or log out
          // For now, redirect to login if unauthorized
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
