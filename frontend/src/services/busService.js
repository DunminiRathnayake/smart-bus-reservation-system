import api from '../api/axios';

/**
 * Service for administrative Bus Management.
 */
const busService = {
  createBus: async (busData) => {
    const response = await api.post('/buses', busData);
    return response.data;
  },

  getBuses: async (params = {}) => {
    const response = await api.get('/buses', { params });
    return response.data;
  },

  getBus: async (id) => {
    const response = await api.get(`/buses/${id}`);
    return response.data;
  },

  updateBus: async (id, busData) => {
    const response = await api.put(`/buses/${id}`, busData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/buses/${id}/status`, { status });
    return response.data;
  },

  deleteBus: async (id) => {
    const response = await api.delete(`/buses/${id}`);
    return response.data;
  }
};

export default busService;
