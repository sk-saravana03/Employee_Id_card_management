import axiosInstance from '../api/axiosInstance';

export const branchService = {
  getBranches: async () => {
    const response = await axiosInstance.get('/branches');
    return response.data;
  },

  getBranchById: async (id) => {
    const response = await axiosInstance.get(`/branches/${id}`);
    return response.data;
  },

  createBranch: async (data) => {
    const response = await axiosInstance.post('/branches', data);
    return response.data;
  },

  updateBranch: async (id, data) => {
    const response = await axiosInstance.put(`/branches/${id}`, data);
    return response.data;
  },

  deleteBranch: async (id) => {
    const response = await axiosInstance.delete(`/branches/${id}`);
    return response.data;
  },
};
