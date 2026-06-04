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

  const guestLogin = (role) => {
    const guestEmployee = role === 'Admin' ? {
      _id: 'guest-admin-id',
      employeeId: 'ADM-GUEST',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      role: 'Admin',
      department: 'HR Operations',
      designation: 'HR Manager',
      joiningDate: '2024-01-01',
      status: 'Active',
      gender: 'Male',
      contactNo: '+1987654321',
      leaveBalance: { paid: 15, sick: 10, unpaid: 0 }
    } : {
      _id: 'guest-employee-id',
      employeeId: 'EMP-GUEST',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: '2024-01-15',
      status: 'Active',
      gender: 'Female',
      contactNo: '+1234567890',
      leaveBalance: { paid: 12, sick: 8, unpaid: 0 }
    };

    localStorage.setItem('token', 'guest-token-' + role.toLowerCase());
    localStorage.setItem('employee', JSON.stringify(guestEmployee));
    localStorage.setItem('is_guest', 'true');
    localStorage.removeItem('logged_out_explicitly');
    setEmployee(guestEmployee);
    return { success: true, employee: guestEmployee };
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedEmployee = localStorage.getItem('employee');
      
      if (token && savedEmployee) {
        try {
          setEmployee(JSON.parse(savedEmployee));
          // Verify token is still valid unless it's a guest session
          if (!token.startsWith('guest-token-') && localStorage.getItem('is_guest') !== 'true') {
            await api.get('/auth/me');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      } else {
        // Auto guest login on initial load, unless user explicitly logged out
        const explicitlyLoggedOut = localStorage.getItem('logged_out_explicitly') === 'true';
        if (!explicitlyLoggedOut) {
          guestLogin('Admin');
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
      localStorage.removeItem('logged_out_explicitly');
      localStorage.removeItem('is_guest');
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
      localStorage.removeItem('logged_out_explicitly');
      localStorage.removeItem('is_guest');
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
    localStorage.removeItem('is_guest');
    localStorage.setItem('logged_out_explicitly', 'true');
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
    guestLogin,
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
