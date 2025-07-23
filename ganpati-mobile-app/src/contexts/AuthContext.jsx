import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Get users from localStorage or use defaults
  const getStoredUsers = () => {
    const stored = localStorage.getItem('ganpati_users');
    return stored ? JSON.parse(stored) : [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@ganpati.com',
        password: '123456',
        role: 'admin'
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'user@test.com',
        password: '123456',
        role: 'user',
        isBlocked: false
      },
      {
        id: 3,
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: '123456',
        role: 'user',
        isBlocked: false
      }
    ];
  };

  const [demoUsers, setDemoUsers] = useState(getStoredUsers());

  const saveUsers = (users) => {
    setDemoUsers(users);
    localStorage.setItem('ganpati_users', JSON.stringify(users));
  };

  const addUser = (userData) => {
    {
    // Check if email already exists
    const existingUser = demoUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: Math.max(...demoUsers.map(u => u.id)) + 1,
      ...userData,
      role: userData.role || 'user',
      isBlocked: false
    };

    const updatedUsers = [...demoUsers, newUser];
    saveUsers(updatedUsers);
    return { success: true, user: newUser };
  };

  const removeUser = (userId) => {
    const updatedUsers = demoUsers.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
    return { success: true };
  };

  const updateUser = (userId, updates) => {
    const updatedUsers = demoUsers.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    saveUsers(updatedUsers);
    return { success: true };
  };

  const getAllUsers = () => {
    return demoUsers.filter(u => u.role === 'user');
  };

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('ganpati_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call
      const foundUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      if (foundUser.role === 'user' && foundUser.isBlocked) {
        throw new Error('Your account has been blocked');
      }

      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('ganpati_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Check if user already exists
      const existingUser = demoUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Simulate user creation
      const newUser = {
        id: Date.now(),
        name,
        email,
        role: 'user'
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('ganpati_user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ganpati_user');
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