import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, User, Lock } from 'lucide-react';
import './Auth.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.employeeId, formData.password);

    if (result.success) {
      // Check if first login - redirect to change password
      if (result.isFirstLogin) {
        toast.success('Welcome! Please change your password.');
        navigate('/change-password');
      } else {
        toast.success('Welcome back!');
        
        // Navigate based on role
        if (result.employee.role === 'Admin' || result.employee.role === 'HR') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1 className="auth-logo">
            <span className="logo-icon">⚡</span>
            DayFlow
          </h1>
          <p className="auth-subtitle">Every workday, perfectly aligned</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">Sign In</h2>

          <div className="form-group">
            <label htmlFor="employeeId">
              <User size={18} />
              Employee ID
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="OIJODO20220001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>

          <p className="auth-footer">
            <small style={{ color: '#6b7280' }}>
              Contact your HR or Admin to create an account
            </small>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
