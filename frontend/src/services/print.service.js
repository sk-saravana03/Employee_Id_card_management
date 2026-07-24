import axiosInstance from '../api/axiosInstance';

export const printService = {
  getPrintQueue: async (params = {}) => {
    const response = await axiosInstance.get('/print/queue', { params });
    return response.data;
  },

  getPrinterHardware: async () => {
    const response = await axiosInstance.get('/print/hardware');
    return response.data;
  },

  togglePrinterPause: async (id) => {
    const response = await axiosInstance.patch(`/print/hardware/${id}/toggle-pause`);
    return response.data;
  },

  processPrintJob: async (id) => {
    const response = await axiosInstance.post(`/print/jobs/${id}/process`);
    return response.data;
  },

  requestReprint: async (payload) => {
    const response = await axiosInstance.post('/print/reprint', payload);
    return response.data;
  },
};
