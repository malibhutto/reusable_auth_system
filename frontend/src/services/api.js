import axios from 'axios';

// Get API base URL from environmental properties
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial to send HttpOnly cookies to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token storage (XSS protected)
let accessToken = null;
let onTokenRefreshedCallback = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (onTokenRefreshedCallback && token) {
    onTokenRefreshedCallback(token);
  }
};

export const getAccessToken = () => accessToken;

export const setOnTokenRefreshed = (callback) => {
  onTokenRefreshedCallback = callback;
};

// Request Interceptor: Attach the current token to Authorization headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401s and automatically refresh the session
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if the refresh request itself fails
    if (originalRequest.url === '/auth/refresh-token') {
      return Promise.reject(error);
    }

    // Check if we hit an expired token 401 error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Execute POST refresh token call
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.data.accessToken;
        
        // Update local variable
        setAccessToken(newAccessToken);

        // Re-inject token into failed request and run again
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, session is completely expired. Revoke memory token.
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
