import axios from 'axios';

// Create axios interceptor to automatically add JWT token to all requests
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    
    if (token) {
      // Clean token - remove 'Bearer ' prefix if already present
      const cleanToken = token.replace('Bearer ', '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is expired or unauthorized, redirect to login
    if (error.response?.status === 401) {
      // Clear stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('authToken');
      
      // Redirect to login page
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default axios;