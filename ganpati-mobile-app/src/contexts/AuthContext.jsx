import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const token = localStorage.getItem('ganpati_token');
    const storedUser = localStorage.getItem('ganpati_user');
    
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      apiService.setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('ganpati_user', JSON.stringify(response.user));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiService.register(name, email, password);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('ganpati_user', JSON.stringify(response.user));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    apiService.logout();
    localStorage.removeItem('ganpati_user');
    localStorage.removeItem('ganpati_token');
  };

  // Admin user management methods
  const addUser = async (userData) => {
    try {
      const response = await apiService.addUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeUser = async (userId) => {
    try {
      await apiService.deleteUser(userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await apiService.updateUser(userId, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getAllUsers = async () => {
    try {
      return await apiService.getAdminUsers();
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    addUser,
    removeUser,
    updateUser,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};