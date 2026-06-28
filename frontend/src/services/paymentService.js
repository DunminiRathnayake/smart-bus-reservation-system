import api from '../api/axios';

/**
 * Service for passenger Payments and administrative Refunds.
 */
const paymentService = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  getMyPayments: async (params = {}) => {
    const response = await api.get('/payments/my', { params });
    return response.data;
  },

  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  getPayments: async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  },

  refundPayment: async (id) => {
    const response = await api.patch(`/admin/payments/${id}/refund`);
    return response.data;
  }
};

export default paymentService;
