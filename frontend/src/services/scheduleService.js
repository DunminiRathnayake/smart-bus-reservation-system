import api from '../api/axios';

/**
 * Service for administrative Schedule Management.
 */
const scheduleService = {
  createSchedule: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  getSchedules: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    return response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/schedules/${id}/status`, { status });
    return response.data;
  },

  deleteSchedule: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  }
};

export default scheduleService;
