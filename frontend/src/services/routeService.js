import api from '../api/axios';

/**
 * Service for administrative Route Management.
 */
const routeService = {
  createRoute: async (routeData) => {
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  getRoutes: async (params = {}) => {
    const response = await api.get('/routes', { params });
    return response.data;
  },

  getRoute: async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  updateRoute: async (id, routeData) => {
    const response = await api.put(`/routes/${id}`, routeData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/routes/${id}/status`, { status });
    return response.data;
  },

  deleteRoute: async (id) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  }
};

export default routeService;
