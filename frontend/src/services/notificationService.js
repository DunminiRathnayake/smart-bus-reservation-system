import api from '../api/axios';

/**
 * Service for passenger Notifications and administrative Broadcasts.
 */
const notificationService = {
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getNotifications: async (params = {}) => {
    const response = await api.get('/admin/notifications', { params });
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  broadcastNotification: async (data) => {
    const response = await api.post('/admin/notifications/broadcast', data);
    return response.data;
  }
};

export default notificationService;
