import api from '../api/axios';

/**
 * Service for passenger Tickets and Conductor scan validation.
 */
const ticketService = {
  getMyTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  getTickets: async (params = {}) => {
    const response = await api.get('/admin/tickets', { params });
    return response.data;
  },

  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  getTicketQr: async (id) => {
    const response = await api.get(`/tickets/${id}/qr`);
    return response.data;
  },

  validateTicket: async (id, auditData = {}) => {
    const response = await api.patch(`/admin/tickets/${id}/validate`, auditData);
    return response.data;
  },

  cancelTicket: async (id) => {
    const response = await api.patch(`/admin/tickets/${id}/cancel`);
    return response.data;
  },

  scanTicket: async (scanData) => {
    const response = await api.post('/tickets/scan', scanData);
    return response.data;
  }
};

export default ticketService;
