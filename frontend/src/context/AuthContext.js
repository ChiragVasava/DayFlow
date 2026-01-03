import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedEmployee = localStorage.getItem('employee');
      
      if (token && savedEmployee) {
        try {
          setEmployee(JSON.parse(savedEmployee));
          // Verify token is still valid
          await api.get('/auth/me');
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (employeeId, password) => {
    try {
      const response = await api.post('/auth/signin', { employeeId, password });
      const { token, employee, isFirstLogin } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('employee', JSON.stringify(employee));
      setEmployee(employee);
      
      return { success: true, employee, isFirstLogin };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, employee } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('employee', JSON.stringify(employee));
      setEmployee(employee);
      
      return { success: true, employee };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setEmployee(null);
  };

  const updateEmployee = (updatedData) => {
    const updated = { ...employee, ...updatedData };
    setEmployee(updated);
    localStorage.setItem('employee', JSON.stringify(updated));
  };

  const value = {
    employee,
    loading,
    login,
    signup,
    logout,
    updateEmployee,
    isAuthenticated: !!employee,
    isAdmin: employee?.role === 'Admin',
    isHR: employee?.role === 'HR',
    isEmployee: employee?.role === 'Employee',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
