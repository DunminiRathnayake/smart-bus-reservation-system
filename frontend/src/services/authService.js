import api from '../api/axios';

/**
 * Handles passenger and administrator login, registration, and logout.
 */
const authService = {
  /**
   * Registers a new passenger.
   * 
   * @param {Object} userData - Registration payload (fullName, email, password, phone, gender, dob).
   * @returns {Promise<Object>} API response payload.
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Logs in a user.
   * 
   * @param {Object} credentials - Login payload (email, password).
   * @returns {Promise<Object>} API response payload containing user object and token.
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Terminate user session.
   * 
   * @returns {Promise<Object>} API response payload.
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default authService;
