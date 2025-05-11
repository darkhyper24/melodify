import axios from 'axios';

// Create base axios instance
const api = axios.create({
  baseURL: 'http://localhost:8787'
});

// Refresh token endpoint
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('http://localhost:8787/auth/refresh', {
      refresh_token: refreshToken
    });

    if (response.data?.access_token && response.data?.refresh_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);
      
      // Also update userRole if it comes back with the response
      if (response.data.user?.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }
      
      return response.data.access_token;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear all auth tokens and trigger a login redirect
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    
    // Dispatch event to notify other components about auth state change
    window.dispatchEvent(new Event('auth-change'));
    
    throw error;
  }
};

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    
    // If response has 401 status and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get new token
        const newToken = await refreshToken();
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api; 