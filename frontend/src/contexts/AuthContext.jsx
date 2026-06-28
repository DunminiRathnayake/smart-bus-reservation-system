import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore and verify session on load
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        try {
          // Fetch fresh user details to check JWT status
          const response = await userService.getMe();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
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
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
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
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
