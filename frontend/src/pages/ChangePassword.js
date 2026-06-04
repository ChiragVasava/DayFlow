import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

function ChangePassword() {
  const navigate = useNavigate();
  const { employee, logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const passwordRules = [
    { id: 'length', label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', label: 'One number', test: (pwd) => /[0-9]/.test(pwd) },
    { id: 'special', label: 'One special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  const getPasswordStrength = () => {
    const passed = passwordRules.filter(rule => rule.test(formData.newPassword)).length;
    if (passed === 0) return { text: '', color: '' };
    if (passed <= 2) return { text: 'Weak', color: '#ef4444' };
    if (passed <= 4) return { text: 'Medium', color: '#f59e0b' };
    return { text: 'Strong', color: '#10b981' };
  };

  const isPasswordValid = () => {
    return passwordRules.every(rule => rule.test(formData.newPassword));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password changed successfully! Please login again.');
      
      // Logout and redirect to signin
      logout();
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="change-password-container">
      <div className="change-password-box">
        <div className="change-password-header">
          <h1>Change Password</h1>
          <p>Please change your system-generated password</p>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
            
            {/* Password Requirements Checklist */}
            {formData.newPassword && (
              <div className="password-requirements">
                <div className="password-strength">
                  <span>Password Strength: </span>
                  <span style={{ color: strength.color, fontWeight: 600 }}>{strength.text}</span>
                </div>
                <ul className="requirements-list">
                  {passwordRules.map(rule => (
                    <li key={rule.id} className={rule.test(formData.newPassword) ? 'valid' : 'invalid'}>
                      {rule.test(formData.newPassword) ? (
                        <Check size={14} className="check-icon" />
                      ) : (
                        <X size={14} className="x-icon" />
                      )}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .change-password-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .change-password-box {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          max-width: 450px;
          width: 100%;
        }

        .change-password-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .change-password-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 10px;
        }

        .change-password-header p {
          color: #666;
          font-size: 14px;
        }

        .change-password-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-top: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-requirements {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          margin-top: 8px;
        }

        .password-strength {
          font-size: 13px;
          margin-bottom: 8px;
          color: #666;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 6px;
        }

        .requirements-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          transition: color 0.2s ease;
        }

        .requirements-list li.valid {
          color: #10b981;
        }

        .requirements-list li.invalid {
          color: #6b7280;
        }

        .check-icon {
          color: #10b981;
        }

        .x-icon {
          color: #ef4444;
        }

        @media (max-width: 480px) {
          .change-password-box {
            padding: 30px 20px;
          }

          .change-password-header h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}

export default ChangePassword;
