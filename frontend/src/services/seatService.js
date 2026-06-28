import api from '../api/axios';

/**
 * Service for administrative Seat layouts management.
 */
const seatService = {
  generateSeats: async (scheduleId, layoutData) => {
    const response = await api.post(`/schedules/${scheduleId}/seats/generate`, layoutData);
    return response.data;
  },

  getSeats: async (scheduleId, params = {}) => {
    const response = await api.get(`/schedules/${scheduleId}/seats`, { params });
    return response.data;
  },

  getSeat: async (scheduleId, seatId) => {
    const response = await api.get(`/schedules/${scheduleId}/seats/${seatId}`);
    return response.data;
  },

  updateStatus: async (scheduleId, seatId, status) => {
    const response = await api.patch(`/schedules/${scheduleId}/seats/${seatId}/status`, { status });
    return response.data;
  },

  deleteSeats: async (scheduleId) => {
    const response = await api.delete(`/schedules/${scheduleId}/seats`);
    return response.data;
  }
};

export default seatService;
