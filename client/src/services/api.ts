import axios from 'axios';

// Flag para evitar loops múltiplos de refresh
let isRefreshing = false;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Evitar loops: não retry se já estamos refreshando, ou se o request for refresh/logout/login
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isRefreshing &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        // Redirecionar para login sem loops
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
