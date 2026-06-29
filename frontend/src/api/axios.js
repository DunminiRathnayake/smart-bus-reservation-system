import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject bearer JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle session expirations and normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize backend error messages into a standard property
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    error.normalizedMessage = message;

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const isPublicRoute = 
        window.location.pathname === '/' || 
        window.location.pathname === '/search-bus' ||
        window.location.pathname === '/forbidden';

      // Prevent redirect loops if the user is already on the login page
      if (!isPublicRoute && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
