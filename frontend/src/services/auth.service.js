import axiosInstance from '../api/axiosInstance';

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await axiosInstance.post('/auth/reset-password', payload);
    return response.data;
  },

  changePassword: async (payload) => {
    const response = await axiosInstance.post('/auth/change-password', payload);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
