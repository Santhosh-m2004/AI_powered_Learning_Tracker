import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

// Request interceptor to add auth token
API.interceptors.request.use(
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

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data?.message && !response.config?.skipToast) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // Skip error handling for certain requests
    if (error.config?.skipErrorHandler) {
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const currentPath = window.location.pathname;
      
      switch (status) {
        case 401:
          // Only redirect if we're not already on login page and not already redirecting
          if (currentPath !== '/login' && currentPath !== '/register' && !isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Use setTimeout to allow current execution to complete
            setTimeout(() => {
              toast.error('Session expired. Please login again.');
              window.location.href = '/login';
            }, 100);
          }
          break;
          
        case 403:
          if (!data?.skipToast) {
            toast.error(data?.message || 'Access denied. You don\'t have permission.');
          }
          break;
          
        case 404:
          if (!data?.skipToast) {
            toast.error(data?.message || 'Resource not found.');
          }
          break;
          
        case 422:
          // Validation errors
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0];
            toast.error(firstError?.message || firstError || 'Validation failed');
          } else if (data?.message) {
            toast.error(data.message);
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please slow down.');
          break;
          
        case 500:
          console.error('Server error:', error);
          toast.error(data?.message || 'Server error. Please try again later.');
          break;
          
        default:
          if (data?.message && !data?.skipToast) {
            toast.error(data.message);
          } else if (status >= 400 && status < 500) {
            toast.error(`Request failed with status ${status}`);
          }
      }
    } else if (error.request) {
      // Network error - no response received
      if (navigator.onLine) {
        toast.error('Unable to connect to server. Please check if the server is running.');
      } else {
        toast.error('No internet connection. Please check your network.');
      }
      console.error('Network error:', error.request);
    } else {
      // Configuration error
      console.error('Request setup error:', error.message);
      toast.error('Request configuration error. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Helper method for file uploads
API.upload = (url, formData, config = {}) => {
  return API.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Helper method for downloads
API.download = (url, config = {}) => {
  return API.get(url, {
    ...config,
    responseType: 'blob',
  });
};

// Reset redirecting flag on successful navigation
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    isRedirecting = false;
  });
}

export default API;