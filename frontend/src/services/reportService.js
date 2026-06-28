import api from '../api/axios';

/**
 * Service for administrative Reports & Analytics.
 */
const reportService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/reports/dashboard');
    return response.data;
  },

  getRevenueReport: async (params = {}) => {
    const response = await api.get('/admin/reports/revenue', { params });
    return response.data;
  },

  getBookingReport: async (params = {}) => {
    const response = await api.get('/admin/reports/bookings', { params });
    return response.data;
  },

  getRouteReport: async () => {
    const response = await api.get('/admin/reports/routes');
    return response.data;
  },

  getBusReport: async () => {
    const response = await api.get('/admin/reports/buses');
    return response.data;
  },

  getDriverReport: async () => {
    const response = await api.get('/admin/reports/drivers');
    return response.data;
  },

  getPaymentReport: async (params = {}) => {
    const response = await api.get('/admin/reports/payments', { params });
    return response.data;
  },

  getSeatReport: async () => {
    const response = await api.get('/admin/reports/seats');
    return response.data;
  },

  getNotificationReport: async () => {
    const response = await api.get('/admin/reports/notifications');
    return response.data;
  }
};

export default reportService;
