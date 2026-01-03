import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Calendar, 
  UserCheck, 
  MapPin,
  DollarSign,
  Shield,
  Clock,
  FileText,
  User,
  Lock,
  CreditCard,
  Home,
  Heart,
  Users,
  Globe,
  Percent,
  TrendingUp,
  Receipt,
  Calendar as Calendar2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import './EmployeeDetail.css';

const EmployeeDetail = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const { employee: currentUser } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('resume');
    const [attendance, setAttendance] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'HR';
    const isOwnProfile = currentUser?._id === employeeId;
    const canViewSalary = isAdmin || isOwnProfile;

    useEffect(() => {
        fetchEmployeeDetail();
    }, [employeeId]);

    const fetchEmployeeDetail = async () => {
        try {
            const response = await api.get(`/employees/${employeeId}`);
            setEmployee(response.data.employee || response.data);
        } catch (error) {
            toast.error('Failed to load employee details');
            navigate('/employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        setAttendanceLoading(true);
        try {
            const response = await api.get('/attendance', {
                params: {
                    employeeId: employeeId
                }
            });
            setAttendance(response.data.attendance || []);
        } catch (error) {
            toast.error('Failed to load attendance records');
        } finally {
            setAttendanceLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'attendance') {
            fetchAttendance();
        }
    }, [activeTab]);

    const calculateSalaryComponent = (monthlyWage, percentage) => {
        if (!monthlyWage || !percentage) return 0;
        return (monthlyWage * percentage / 100).toFixed(2);
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present':
                return <CheckCircle size={20} color="#10b981" />;
            case 'Absent':
                return <XCircle size={20} color="#dc2626" />;
            case 'Half-day':
                return <Clock size={20} color="#f59e0b" />;
            case 'Leave':
                return <Calendar2 size={20} color="#3b82f6" />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Present':
                return 'badge-success';
            case 'Absent':
                return 'badge-danger';
            case 'Half-day':
                return 'badge-warning';
            case 'Leave':
                return 'badge-info';
            default:
                return '';
        }
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

    if (!employee) {
        return (
            <Layout>
                <div className="error-container">
                    <p>Employee not found</p>
                </div>
            </Layout>
        );
    }

    const monthlyWage = employee?.salaryInfo?.monthlyWage || employee?.salary || 0;
    const yearlyWage = employee?.salaryInfo?.yearlyWage || (monthlyWage * 12);

    return (
        <Layout>
            <div className="employee-detail-page">
                <div className="detail-header">
                    <button className="back-button" onClick={() => navigate('/employees')}>
                        <ArrowLeft size={20} />
                        Back to Employees
                    </button>
                </div>

                <div className="profile-container">
                    {/* Header Section */}
                    <div className="profile-header">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                            </div>
                            <div className="profile-header-info">
                                <h1 className="profile-name">
                                    {employee?.firstName} {employee?.lastName}
                                </h1>
                                <p className="profile-designation">{employee?.designation || 'Employee'}</p>
                                <div className="profile-meta">
                                    <span className="profile-meta-item">
                                        <Building2 size={14} />
                                        {employee?.department || 'N/A'}
                                    </span>
                                    <span className="profile-meta-item">
                                        <Mail size={14} />
                                        {employee?.email}
                                    </span>
                                    <span className="profile-meta-item">
                                        <Phone size={14} />
                                        {employee?.phoneNumber || 'N/A'}
                                    </span>
                                    <span className="profile-meta-item">
                                        <MapPin size={14} />
                                        {employee?.address || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-status-badges">
                            <span className={`profile-status-badge ${employee?.isActive ? 'active' : 'inactive'}`}>
                                {employee?.isActive ? '● Active' : '● Inactive'}
                            </span>
                            <span className={`profile-role-badge role-${employee?.role?.toLowerCase()}`}>
                                <Shield size={14} />
                                {employee?.role}
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'resume' ? 'active' : ''}`}
                            onClick={() => setActiveTab('resume')}
                        >
                            <FileText size={18} />
                            Resume
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'private' ? 'active' : ''}`}
                            onClick={() => setActiveTab('private')}
                        >
                            <User size={18} />
                            Private Info
                        </button>
                        {canViewSalary && (
                            <button 
                                className={`tab-button ${activeTab === 'salary' ? 'active' : ''}`}
                                onClick={() => setActiveTab('salary')}
                            >
                                <DollarSign size={18} />
                                Salary Info
                            </button>
                        )}
                        {isAdmin && (
                            <button 
                                className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('attendance')}
                            >
                                <Calendar2 size={18} />
                                Attendance
                            </button>
                        )}
                        <button 
                            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={18} />
                            Security
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* Resume Tab */}
                        {activeTab === 'resume' && (
                            <div className="tab-panel">
                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Briefcase size={20} />
                                        Employment Information
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Employee ID</label>
                                            <p>{employee?.employeeId}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Department</label>
                                            <p>{employee?.department || 'Not assigned'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Designation</label>
                                            <p>{employee?.designation || 'Not assigned'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Date of Joining</label>
                                            <p>{employee?.dateOfJoining ? format(new Date(employee.dateOfJoining), 'MMMM dd, yyyy') : 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Employment Type</label>
                                            <p>Full Time</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Work Location</label>
                                            <p>{employee?.address || 'Office'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Mail size={20} />
                                        Contact Information
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Email Address</label>
                                            <p>{employee?.email}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone Number</label>
                                            <p>{employee?.phoneNumber || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Address</label>
                                            <p>{employee?.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Clock size={20} />
                                        Account Information
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Account Status</label>
                                            <p className={employee?.isActive ? 'text-success' : 'text-danger'}>
                                                {employee?.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                        <div className="info-item">
                                            <label>Role</label>
                                            <p>{employee?.role}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Account Created</label>
                                            <p>{employee?.createdAt ? format(new Date(employee.createdAt), 'MMMM dd, yyyy') : 'Unknown'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Last Updated</label>
                                            <p>{employee?.updatedAt ? format(new Date(employee.updatedAt), 'MMMM dd, yyyy') : 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Private Info Tab */}
                        {activeTab === 'private' && (
                            <div className="tab-panel">
                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <User size={20} />
                                        Personal Information
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Date of Birth</label>
                                            <p>{employee?.privateInfo?.dateOfBirth ? format(new Date(employee.privateInfo.dateOfBirth), 'MMMM dd, yyyy') : 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Gender</label>
                                            <p>{employee?.privateInfo?.gender || 'Not specified'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Marital Status</label>
                                            <p>{employee?.privateInfo?.maritalStatus || 'Not specified'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Nationality</label>
                                            <p>{employee?.privateInfo?.nationality || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Personal Email</label>
                                            <p>{employee?.privateInfo?.personalEmail || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Residential Address</label>
                                            <p>{employee?.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Heart size={20} />
                                        Emergency Contact
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Contact Name</label>
                                            <p>{employee?.privateInfo?.emergencyContact?.name || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Relationship</label>
                                            <p>{employee?.privateInfo?.emergencyContact?.relationship || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Contact Phone</label>
                                            <p>{employee?.privateInfo?.emergencyContact?.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <CreditCard size={20} />
                                        Bank Details
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Account Number</label>
                                            <p>{employee?.bankDetails?.accountNumber || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Bank Name</label>
                                            <p>{employee?.bankDetails?.bankName || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>IFSC Code</label>
                                            <p>{employee?.bankDetails?.ifscCode || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>PAN Number</label>
                                            <p>{employee?.bankDetails?.panNumber || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>UAN Number</label>
                                            <p>{employee?.bankDetails?.uanNumber || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Employee Code</label>
                                            <p>{employee?.bankDetails?.employeeCode || employee?.employeeId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Salary Info Tab - Admin/HR and Own Profile */}
                        {activeTab === 'salary' && canViewSalary && (
                            <div className="tab-panel">
                                <div className="salary-overview">
                                    <div className="salary-card">
                                        <div className="salary-card-header">
                                            <DollarSign size={24} />
                                            <div>
                                                <h4>Monthly Wage</h4>
                                                <p className="salary-amount">{formatCurrency(monthlyWage)}</p>
                                                <span className="salary-period">/month</span>
                                            </div>
                                        </div>
                                        <div className="salary-card-footer">
                                            <span>Working Days: {employee?.salaryInfo?.workingDaysPerWeek || 5} days/week</span>
                                        </div>
                                    </div>

                                    <div className="salary-card">
                                        <div className="salary-card-header">
                                            <TrendingUp size={24} />
                                            <div>
                                                <h4>Yearly Wage</h4>
                                                <p className="salary-amount">{formatCurrency(yearlyWage)}</p>
                                                <span className="salary-period">/year</span>
                                            </div>
                                        </div>
                                        <div className="salary-card-footer">
                                            <span>Break Time: {employee?.salaryInfo?.breakTimeHours || 1} hrs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Receipt size={20} />
                                        Salary Components
                                    </h3>
                                    <div className="salary-components">
                                        <div className="component-item">
                                            <div className="component-header">
                                                <span className="component-label">Basic Salary</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.components?.basicSalary?.percentage || 50}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.components?.basicSalary?.percentage || 50))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                Basic salary from compensation, forms the base for calculating all other components
                                            </p>
                                        </div>

                                        <div className="component-item">
                                            <div className="component-header">
                                                <span className="component-label">House Rent Allowance</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.components?.houseRentAllowance?.percentage || 50}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.components?.houseRentAllowance?.percentage || 50))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                HRA provided to employees, 50% of the basic salary
                                            </p>
                                        </div>

                                        <div className="component-item">
                                            <div className="component-header">
                                                <span className="component-label">Standard Allowance</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.components?.standardAllowance?.percentage || 16.67}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.components?.standardAllowance?.percentage || 16.67))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                A standard amount as fixed component calculated based on the company policy
                                            </p>
                                        </div>

                                        <div className="component-item">
                                            <div className="component-header">
                                                <span className="component-label">Performance Bonus</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.components?.performanceBonus?.percentage || 6.33}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.components?.performanceBonus?.percentage || 6.33))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                Variable amount paid during payroll. The value defined by the company and calculated as 6.33% of the basic salary
                                            </p>
                                        </div>

                                        <div className="component-item">
                                            <div className="component-header">
                                                <span className="component-label">Leave Travel Allowance</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.components?.leaveTravelAllowance?.percentage || 6.33}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.components?.leaveTravelAllowance?.percentage || 6.33))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                LTA is paid by the company to employees to cover their travel expenses, calculated as 6.33% of the basic salary
                                            </p>
                                        </div>

                                        <div className="component-item">
                                            <div className="component-header">
                                                <span className="component-label">Fixed Allowance</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.components?.fixedAllowance?.percentage || 11.67}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.components?.fixedAllowance?.percentage || 11.67))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                Fixed Allowance is a percentage of wages to determined after calculating all of salary components
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Percent size={20} />
                                        Provident Fund (PF) Contribution
                                    </h3>
                                    <div className="salary-components">
                                        <div className="component-item pf-item">
                                            <div className="component-header">
                                                <span className="component-label">Employee Contribution</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                PF is calculated based on the basic salary
                                            </p>
                                        </div>

                                        <div className="component-item pf-item">
                                            <div className="component-header">
                                                <span className="component-label">Employer Contribution</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.providentFund?.employerContribution?.percentage || 12}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.providentFund?.employerContribution?.percentage || 12))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                PF is calculated based on the basic salary
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Receipt size={20} />
                                        Tax Deductions
                                    </h3>
                                    <div className="salary-components">
                                        <div className="component-item tax-item">
                                            <div className="component-header">
                                                <span className="component-label">Professional Tax</span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(employee?.salaryInfo?.taxDeductions?.professionalTax || 200)}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                Professional Tax deducted from the Gross Salary
                                            </p>
                                        </div>

                                        <div className="component-item tax-item">
                                            <div className="component-header">
                                                <span className="component-label">Income Tax</span>
                                                <span className="component-percentage">
                                                    {employee?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0}%
                                                </span>
                                            </div>
                                            <div className="component-value">
                                                {formatCurrency(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0))}
                                                <span className="component-period">/month</span>
                                            </div>
                                            <p className="component-description">
                                                Income Tax is calculated based on tax slab and deductions
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="salary-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Gross Salary</span>
                                        <span className="summary-value">{formatCurrency(monthlyWage)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Deductions</span>
                                        <span className="summary-value deduction">
                                            - {formatCurrency(
                                                parseFloat(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12)) +
                                                parseFloat(employee?.salaryInfo?.taxDeductions?.professionalTax || 200) +
                                                parseFloat(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0))
                                            )}
                                        </span>
                                    </div>
                                    <div className="summary-item total">
                                        <span className="summary-label">Net Salary</span>
                                        <span className="summary-value">
                                            {formatCurrency(
                                                monthlyWage - (
                                                    parseFloat(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.providentFund?.employeeContribution?.percentage || 12)) +
                                                    parseFloat(employee?.salaryInfo?.taxDeductions?.professionalTax || 200) +
                                                    parseFloat(calculateSalaryComponent(monthlyWage, employee?.salaryInfo?.taxDeductions?.incomeTax?.percentage || 0))
                                                )
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Tab */}
                        {activeTab === 'attendance' && isAdmin && (
                            <div className="tab-panel">
                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Calendar2 size={20} />
                                        Attendance Records
                                    </h3>
                                    {attendanceLoading ? (
                                        <div className="loading-container">
                                            <div className="spinner"></div>
                                            <p>Loading attendance records...</p>
                                        </div>
                                    ) : attendance.length > 0 ? (
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Check In</th>
                                                        <th>Check Out</th>
                                                        <th>Work Hours</th>
                                                        <th>Remarks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendance.slice(0, 30).map((record) => (
                                                        <tr key={record._id}>
                                                            <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                                                            <td>
                                                                <span className={`badge ${getStatusClass(record.status)}`}>
                                                                    {record.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {record.checkIn 
                                                                    ? format(new Date(record.checkIn), 'h:mm a')
                                                                    : '-'}
                                                            </td>
                                                            <td>
                                                                {record.checkOut 
                                                                    ? format(new Date(record.checkOut), 'h:mm a')
                                                                    : '-'}
                                                            </td>
                                                            <td>
                                                                {record.workHours > 0 
                                                                    ? `${record.workHours.toFixed(2)} hrs`
                                                                    : '-'}
                                                            </td>
                                                            <td>{record.remarks || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {attendance.length > 30 && (
                                                <p className="table-footer-note">
                                                    Showing latest 30 records out of {attendance.length} total records
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="empty-state">No attendance records found for this employee.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="tab-panel">
                                <div className="info-section">
                                    <h3 className="section-heading">
                                        <Lock size={20} />
                                        Account Security
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Account Status</label>
                                            <p className={employee?.isActive ? 'text-success' : 'text-danger'}>
                                                {employee?.isActive ? '● Active' : '● Inactive'}
                                            </p>
                                        </div>
                                        <div className="info-item">
                                            <label>First Login Status</label>
                                            <p>{employee?.isFirstLogin ? 'Pending Password Change' : 'Password Changed'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Account Created</label>
                                            <p>{employee?.createdAt ? format(new Date(employee.createdAt), 'MMMM dd, yyyy HH:mm') : 'Unknown'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Last Updated</label>
                                            <p>{employee?.updatedAt ? format(new Date(employee.updatedAt), 'MMMM dd, yyyy HH:mm') : 'Unknown'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Email Verified</label>
                                            <p>{employee?.isVerified ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Role</label>
                                            <p>{employee?.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmployeeDetail;
