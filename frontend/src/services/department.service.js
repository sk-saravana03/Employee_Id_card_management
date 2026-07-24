import axiosInstance from '../api/axiosInstance';

export const departmentService = {
  getDepartments: async (branchId = '') => {
    const response = await axiosInstance.get('/departments', {
      params: branchId ? { branch: branchId } : {},
    });
    return response.data;
  },

  getDepartmentById: async (id) => {
    const response = await axiosInstance.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await axiosInstance.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await axiosInstance.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await axiosInstance.delete(`/departments/${id}`);
    return response.data;
  },
};
