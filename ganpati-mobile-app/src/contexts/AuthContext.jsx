import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, dbHelpers } from '../services/supabase';

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
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email,
          email: session.user.email,
          role: session.user.user_metadata.role || 'user'
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email,
            email: session.user.email,
            role: session.user.user_metadata.role || 'user'
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await dbHelpers.signIn(email, password);

      setUser({
        id: data.user.id,
        name: data.user.user_metadata.name || data.user.email,
        email: data.user.email,
        role: data.user.user_metadata.role || 'user'
      });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await dbHelpers.signUp(email, password, name);

      setUser({
        id: data.user.id,
        name: name,
        email: data.user.email,
        role: 'user'
      });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await dbHelpers.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Admin user management methods
  const addUser = async (userData) => {
    try {
      await dbHelpers.addUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeUser = async (userId) => {
    try {
      await dbHelpers.deleteUser(userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await dbHelpers.updateUser(userId, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getAllUsers = async () => {
    try {
      return await dbHelpers.getAdminUsers();
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