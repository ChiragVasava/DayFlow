import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';

function CreateEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    department: '',
    salary: '',
    dateOfJoining: '',
    role: 'Employee',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/create-employee', formData);
      const { employeeId, generatedPassword, employee } = response.data;

      setGeneratedCredentials({ employeeId, password: generatedPassword });
      toast.success('Employee created successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        designation: '',
        department: '',
        salary: '',
        dateOfJoining: '',
        role: 'Employee',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCredentials = () => {
    setGeneratedCredentials(null);
  };

  return (
    <div className="create-employee-page">
      <div className="page-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Create New Employee</h1>
        <p>Add a new employee to the system</p>
      </div>

      <div className="create-employee-container">
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <User size={18} />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <User size={18} />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="employee@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={18} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Briefcase size={18} />
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Briefcase size={18} />
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Calendar size={18} />
                Joining Date
              </label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <User size={18} />
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Briefcase size={18} />
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Employee...' : 'Create Employee'}
          </button>
        </form>
      </div>

      {generatedCredentials && (
        <div className="credentials-modal-overlay" onClick={handleCloseCredentials}>
          <div className="credentials-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Employee Created Successfully!</h2>
            <p>Please save these credentials and share them with the employee:</p>
            
            <div className="credentials-box">
              <div className="credential-item">
                <strong>Employee ID:</strong>
                <span className="credential-value">{generatedCredentials.employeeId}</span>
              </div>
              <div className="credential-item">
                <strong>Temporary Password:</strong>
                <span className="credential-value">{generatedCredentials.password}</span>
              </div>
            </div>

            <div className="credentials-note">
              <strong>Important:</strong> The employee must change this password upon first login.
            </div>

            <button onClick={handleCloseCredentials} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .create-employee-page {
          padding: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 2px solid #e0e0e0;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .back-btn:hover {
          background: #f5f5f5;
          border-color: #667eea;
          color: #667eea;
        }

        .page-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #666;
          font-size: 16px;
        }

        .create-employee-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }

        .employee-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
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

        .credentials-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .credentials-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .credentials-modal h2 {
          color: #28a745;
          margin-bottom: 15px;
          font-size: 24px;
        }

        .credentials-modal p {
          color: #666;
          margin-bottom: 20px;
        }

        .credentials-box {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .credential-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .credential-item:last-child {
          border-bottom: none;
        }

        .credential-item strong {
          color: #333;
          font-size: 14px;
        }

        .credential-value {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 8px 15px;
          border-radius: 6px;
          color: #667eea;
          font-weight: bold;
          font-size: 16px;
        }

        .credentials-note {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #856404;
        }

        .credentials-note strong {
          display: block;
          margin-bottom: 5px;
        }

        .close-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .close-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .create-employee-container {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
}

export default CreateEmployee;
