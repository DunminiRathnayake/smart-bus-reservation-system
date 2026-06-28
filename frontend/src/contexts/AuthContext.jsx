import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext(null);

/**
 * Normalizes user role fields, mapping backend strings (ADMIN/PASSENGER)
 * to frontend conventions (ROLE_ADMIN/ROLE_PASSENGER).
 */
const normalizeUser = (userData) => {
  if (!userData) return null;
  let role = userData.role;
  if (role && !role.startsWith('ROLE_')) {
    role = `ROLE_${role}`;
  }
  return { ...userData, role };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore and verify session on load
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        setUser(normalizeUser(JSON.parse(savedUser)));
        try {
          // Fetch fresh user details to check JWT status
          const response = await userService.getMe();
          if (response.success && response.data.user) {
            const normalized = normalizeUser(response.data.user);
            setUser(normalized);
            localStorage.setItem('user', JSON.stringify(normalized));
          }
        } catch (error) {
          console.error('Session check failed. Token might be expired:', error);
          // If token expired, axios response interceptor will auto-clear and redirect
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * Completes login by storing token and details.
   */
  const login = (userData, token) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    localStorage.setItem('token', token);
    setUser(normalized);
  };

  /**
   * Registers a new passenger.
   */
  const register = async (userData) => {
    return await authService.register(userData);
  };

  /**
   * Logs out the user and clears all credentials.
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * Refreshes active user information from backend.
   */
  const refreshUser = async () => {
    try {
      const response = await userService.getMe();
      if (response.success && response.data.user) {
        const normalized = normalizeUser(response.data.user);
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      }
    } catch (error) {
      console.error('Failed to refresh user profile data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
