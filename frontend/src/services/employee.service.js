import axiosInstance from '../api/axiosInstance';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await axiosInstance.get('/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await axiosInstance.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await axiosInstance.put(`/employees/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, payload) => {
    const response = await axiosInstance.patch(`/employees/${id}/status`, payload);
    return response.data;
  },

  bulkImport: async (employees) => {
    const response = await axiosInstance.post('/employees/bulk-import', { employees });
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await axiosInstance.delete(`/employees/${id}`);
    return response.data;
  },
};
