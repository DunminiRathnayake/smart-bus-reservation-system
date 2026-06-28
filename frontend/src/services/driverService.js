import api from '../api/axios';

/**
 * Service for administrative Driver/Conductor Management.
 */
const driverService = {
  createDriver: async (driverData) => {
    const response = await api.post('/drivers', driverData);
    return response.data;
  },

  getDrivers: async (params = {}) => {
    const response = await api.get('/drivers', { params });
    return response.data;
  },

  getDriver: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  updateDriver: async (id, driverData) => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/drivers/${id}/status`, { status });
    return response.data;
  },

  deleteDriver: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  }
};

export default driverService;
