import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending HTTP-Only cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token + Log outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Store request start time for duration calculation
    config.metadata = { startTime: Date.now() };
    console.log(
      `%c[API ▶] ${(config.method || 'GET').toUpperCase().padEnd(6)} ${config.baseURL || ''}${config.url}`,
      'color: #6366f1; font-weight: bold;'
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Log status codes + Auto Refresh Token on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper: log response status with colors
const logResponse = (config, status, isError = false) => {
  const method = (config?.method || 'GET').toUpperCase().padEnd(6);
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  const duration = config?.metadata ? `${Date.now() - config.metadata.startTime}ms` : '';
  let color = '#22c55e'; // green = 2xx
  if (status >= 500) color = '#ef4444';
  else if (status >= 400) color = '#f59e0b';
  else if (status >= 300) color = '#06b6d4';
  const label = isError ? '[API ✗]' : '[API ✔]';
  console.log(
    `%c${label} ${method} ${url} → ${status}  (${duration})`,
    `color: ${color}; font-weight: bold;`
  );
};

axiosInstance.interceptors.response.use(
  (response) => {
    logResponse(response.config, response.status);
    return response;
  },
  async (error) => {
    // Log error responses (4xx, 5xx, network errors)
    if (error.response) {
      logResponse(error.config, error.response.status, true);
    } else {
      console.log(
        `%c[API ✗] ${(error.config?.method || 'GET').toUpperCase()}  ${error.config?.url || ''}  → NETWORK ERROR`,
        'color: #ef4444; font-weight: bold;'
      );
    }
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
