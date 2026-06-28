import api from '../api/axios';

/**
 * Service for profile management and user administration.
 */
const userService = {
  /**
   * Get authenticated user profile details.
   */
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Update passenger profile.
   */
  updateMe: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },

  /**
   * List all users (Admin only).
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Retrieve user by ID (Admin only).
   */
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user details (Admin only).
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Update user status (Admin only).
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  /**
   * Deactivate a user session (Admin only).
   */
  deactivate: async (id) => {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Reactivate a deactivated user session (Admin only).
   */
  reactivate: async (id) => {
    const response = await api.patch(`/users/${id}/reactivate`);
    return response.data;
  },

  /**
   * Soft-delete a user record (Admin only).
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
