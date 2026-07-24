import axiosInstance from '../api/axiosInstance';

export const idCardService = {
  getIdCards: async (params = {}) => {
    const response = await axiosInstance.get('/id-cards', { params });
    return response.data;
  },

  getIdCardById: async (id) => {
    const response = await axiosInstance.get(`/id-cards/${id}`);
    return response.data;
  },

  generateIdCard: async (data) => {
    const response = await axiosInstance.post('/id-cards/generate', data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/id-cards/${id}/status`, { status });
    return response.data;
  },
};
