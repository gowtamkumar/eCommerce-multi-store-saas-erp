import axios from 'axios';
import { useAuthStore } from './store';

export const apiClient = axios.create();

// Request interceptor to dynamically set base URL and append SaaS scoping headers
apiClient.interceptors.request.use(
  (config) => {
    const { apiBaseUrl, token, storeId, activeBranchId, activeWarehouseId } = useAuthStore.getState();

    // Dynamically set the resolved tenant API URL
    if (apiBaseUrl) {
      config.baseURL = apiBaseUrl;
    }

    // Attach Bearer Token if authenticated
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach multi-store SaaS scoping headers
    if (storeId) {
      config.headers['x-store-id'] = storeId;
    }
    if (activeBranchId) {
      config.headers['x-branch-id'] = activeBranchId;
    }
    if (activeWarehouseId) {
      config.headers['x-warehouse-id'] = activeWarehouseId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s and handle automatic JWT token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger token refresh if request fails with 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { refreshToken, apiBaseUrl, setLoginData, logout } = useAuthStore.getState();
      
      if (refreshToken) {
        try {
          // Check if request is storefront/auth or admin, and resolve the correct endpoint
          const isStorefront = originalRequest.url?.includes('/store/') || originalRequest.url?.includes('/auth/');
          const refreshPath = isStorefront ? '/auth/refresh' : '/admin/refresh';
          const refreshUrl = `${apiBaseUrl || ''}${refreshPath}`;

          const response = await axios.post(refreshUrl, { refreshToken });
          
          if (response.data?.success && response.data?.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
            setLoginData(user, accessToken, newRefreshToken);
            
            // Update the original request's Authorization header and retry
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed -> force logout
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  }
);
