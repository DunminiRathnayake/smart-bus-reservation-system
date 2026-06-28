import api from '../api/axios';

/**
 * Service for passenger and administrator Booking Management.
 */
const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  }
};

export default bookingService;
