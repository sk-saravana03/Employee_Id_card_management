import axiosInstance from '../api/axiosInstance';

export const visitorService = {
  getVisitors: async (params = {}) => {
    const response = await axiosInstance.get('/visitors', { params });
    return response.data;
  },

  getVisitorById: async (id) => {
    const response = await axiosInstance.get(`/visitors/${id}`);
    return response.data;
  },

  registerVisitor: async (data) => {
    const response = await axiosInstance.post('/visitors/register', data);
    return response.data;
  },

  updateApproval: async (id, status, notes = '') => {
    const response = await axiosInstance.patch(`/visitors/${id}/approval`, {
      status,
      approvalNotes: notes,
    });
    return response.data;
  },

  checkInVisitor: async (id) => {
    const response = await axiosInstance.post(`/visitors/${id}/check-in`);
    return response.data;
  },

  checkOutVisitor: async (id) => {
    const response = await axiosInstance.post(`/visitors/${id}/check-out`);
    return response.data;
  },

  cleanupExpired: async () => {
    const response = await axiosInstance.delete('/visitors/cleanup-expired');
    return response.data;
  },
};
