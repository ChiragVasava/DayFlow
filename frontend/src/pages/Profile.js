import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Save, X, DollarSign, Receipt, Percent, TrendingUp, Camera } from 'lucide-react';
import { format } from 'date-fns';
import './Profile.css';

const Profile = () => {
  const { employee, updateEmployee } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/employees/${employee._id}`);
      setProfile(response.data.employee);
      setFormData(response.data.employee);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put(`/employees/${employee._id}`, formData);
      setProfile(response.data.employee);
      updateEmployee(response.data.employee);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post(`/employees/${employee._id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data.employee);
      updateEmployee(response.data.employee);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const calculateSalaryComponent = (monthlyWage, percentage) => {
    if (!monthlyWage || !percentage) return 0;
    return (monthlyWage * percentage / 100).toFixed(2);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const isAdmin = employee.role === 'Admin' || employee.role === 'HR';

  const monthlyWage = profile?.salaryInfo?.monthlyWage || profile?.salary || 0;
  const yearlyWage = profile?.salaryInfo?.yearlyWage || (monthlyWage * 12);

  return (
    <Layout>
      <div className="profile-page">
        <div className="page-header">
          <h1>My Profile</h1>
          {!editing && activeTab === 'personal' && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-container">
          {/* Profile Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <User size={18} />
              Personal Info
            </button>
            <button
              className={`tab-button ${activeTab === 'salary' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary')}
            >
              <DollarSign size={18} />
              Salary Info
            </button>
          </div>
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="tab-panel">
              {/* Profile Header */}
              <div className="profile-header-card">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="profile-image" />
                ) : (
                  <>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</>
                )}
              </div>
              <button 
                className="photo-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change photo"
              >
                {uploadingPhoto ? (
                  <div className="mini-spinner"></div>
                ) : (
                  <Camera size={16} />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-info">
              <h2>{profile?.firstName} {profile?.lastName}</h2>
              <p className="profile-role">{profile?.role}</p>
              {profile?.designation && (
                <p className="profile-designation">
                  {profile.designation}
                  {profile?.department && ` • ${profile.department}`}
                </p>
              )}
              <p className="profile-id">ID: {profile?.employeeId}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="profile-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    First Name
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="form-value">{profile?.firstName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <User size={16} />
                    Last Name
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="form-value">{profile?.lastName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="form-value">{profile?.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">
                      {profile?.dateOfBirth 
                        ? format(new Date(profile.dateOfBirth), 'MMM dd, yyyy')
                        : 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Date of Joining
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining ? formData.dateOfJoining.split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">
                      {profile?.dateOfJoining 
                        ? format(new Date(profile.dateOfJoining), 'MMM dd, yyyy')
                        : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3 className="section-title">Address</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    <MapPin size={16} />
                    Street
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.address?.street || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>City</label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.address?.city || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>State</label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.address?.state || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Zip Code</label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address?.zipCode || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.address?.zipCode || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Country</label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address?.country || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.address?.country || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3 className="section-title">Job Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <Briefcase size={16} />
                    Department
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.department || 'Not assigned'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <Briefcase size={16} />
                    Designation
                  </label>
                  {editing && isAdmin ? (
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.designation || 'Not assigned'}</p>
                  )}
                </div>
              </div>
            </div>

            {editing && (
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
            </div>
          )}

          {/* Salary Info Tab */}
          {activeTab === 'salary' && (
            <div className="tab-panel">
              <div className="salary-section-simple">
                {/* Main Salary Display */}
                <div className="salary-hero">
                  <div className="salary-hero-content">
                    <p className="salary-hero-label">Your Monthly Salary</p>
                    <h1 className="salary-hero-amount">{formatCurrency(monthlyWage)}</h1>
                    <p className="salary-hero-subtitle">Gross Pay / Month</p>
                  </div>
                </div>

                {/* Salary Summary Cards */}
                <div className="salary-summary-cards">
                  <div className="summary-card">
                    <div className="summary-card-icon gross">
                      <DollarSign size={24} />
                    </div>
                    <div className="summary-card-content">
                      <p className="summary-card-label">Gross Salary</p>
                      <p className="summary-card-amount">{formatCurrency(monthlyWage)}</p>
                      <p className="summary-card-period">per month</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-icon deductions">
                      <Percent size={24} />
                    </div>
                    <div className="summary-card-content">
                      <p className="summary-card-label">Total Deductions</p>
                      <p className="summary-card-amount deduction">
                        {formatCurrency(
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12)) +
                          parseFloat(profile?.salaryInfo?.taxDeductions?.professionalTax || 200) +
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0))
                        )}
                      </p>
                      <p className="summary-card-period">per month</p>
                    </div>
                  </div>

                  <div className="summary-card highlight">
                    <div className="summary-card-icon net">
                      <TrendingUp size={24} />
                    </div>
                    <div className="summary-card-content">
                      <p className="summary-card-label">Net Salary</p>
                      <p className="summary-card-amount net">
                        {formatCurrency(
                          monthlyWage - (
                            parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12)) +
                            parseFloat(profile?.salaryInfo?.taxDeductions?.professionalTax || 200) +
                            parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0))
                          )
                        )}
                      </p>
                      <p className="summary-card-period">Take Home / Month</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-icon yearly">
                      <Receipt size={24} />
                    </div>
                    <div className="summary-card-content">
                      <p className="summary-card-label">Annual CTC</p>
                      <p className="summary-card-amount">{formatCurrency(yearlyWage)}</p>
                      <p className="summary-card-period">per year</p>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="salary-info-box">
                  <h3 className="info-box-title">Salary Information</h3>
                  <div className="info-box-grid">
                    <div className="info-box-item">
                      <span className="info-label">Basic Salary</span>
                      <span className="info-value">
                        {formatCurrency(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.components?.basicSalary?.percentage || 50))}
                      </span>
                    </div>
                    <div className="info-box-item">
                      <span className="info-label">Allowances</span>
                      <span className="info-value">
                        {formatCurrency(
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.components?.hra?.percentage || 16.67)) +
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.components?.travelAllowance?.percentage || 10)) +
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.components?.medicalAllowance?.percentage || 5)) +
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.components?.specialAllowance?.percentage || 15)) +
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.components?.otherAllowance?.percentage || 3.33))
                        )}
                      </span>
                    </div>
                    <div className="info-box-item">
                      <span className="info-label">Provident Fund</span>
                      <span className="info-value">
                        {formatCurrency(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12))}
                      </span>
                    </div>
                    <div className="info-box-item">
                      <span className="info-label">Tax Deducted</span>
                      <span className="info-value">
                        {formatCurrency(
                          parseFloat(profile?.salaryInfo?.taxDeductions?.professionalTax || 200) +
                          parseFloat(calculateSalaryComponent(monthlyWage, profile?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0))
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="info-box-note">
                    <strong>Note:</strong> For detailed salary breakdown and tax information, please contact HR department.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
