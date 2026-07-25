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

  requestPhysicalCard: async (data = {}) => {
    const response = await axiosInstance.post('/id-cards/request', data);
    return response.data;
  },

  generateIdCard: async (data) => {
    const response = await axiosInstance.post('/id-cards/generate', data);
    return response.data;
  },

  hrApprove: async (id, comment = '') => {
    const response = await axiosInstance.patch(`/id-cards/${id}/hr-approve`, { comment });
    return response.data;
  },

  adminApprove: async (id, comment = '') => {
    const response = await axiosInstance.patch(`/id-cards/${id}/admin-approve`, { comment });
    return response.data;
  },

  markPrinted: async (id, status = 'PRINTED') => {
    const response = await axiosInstance.patch(`/id-cards/${id}/print`, { status });
    return response.data;
  },

  rejectRequest: async (id, reason = '') => {
    const response = await axiosInstance.patch(`/id-cards/${id}/reject`, { reason });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/id-cards/${id}/status`, { status });
    return response.data;
  },
};
