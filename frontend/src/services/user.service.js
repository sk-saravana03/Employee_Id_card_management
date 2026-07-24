import axiosInstance from '../api/axiosInstance';

export const userService = {
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  getRoles: async () => {
    const response = await axiosInstance.get('/users/roles');
    return response.data;
  },

  createUser: async (data) => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  resetUserPassword: async (id, newPassword) => {
    const response = await axiosInstance.post(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
};
