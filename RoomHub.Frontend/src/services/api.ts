import axios from 'axios';

const API_BASE_URL = 'http://localhost:5143/api';

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

let refreshPromise: Promise<string | null> | null = null;

const clearSessionAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userEmail');
  if (window.location.pathname !== '/login') {
    window.location.hash = '';
    window.location.href = '/login';
  }
};

// Response interceptor: on 401, try once to exchange the refresh token for a new access token
// and replay the original request; log the user out if that fails too.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken })
            .then((res) => {
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('refreshToken', res.data.refreshToken);
              return res.data.token as string;
            })
            .catch(() => null)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (!newToken) {
          clearSessionAndRedirect();
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearSessionAndRedirect();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
