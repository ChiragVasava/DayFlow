import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  DollarSign, TrendingUp, Calendar, Download, Plus, 
  Edit, Trash2, Search, X, Save, Check, AlertCircle,
  FileText, ArrowUp, ArrowDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import './PayrollManagement.css';

const PayrollManagement = () => {
  const { employee } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const isAdmin = employee?.role === 'Admin' || employee?.role === 'HR';

  useEffect(() => {
    fetchPayrolls();
    if (isAdmin) {
      fetchAllEmployees();
    }
  }, [isAdmin]);

  const fetchAllEmployees = async () => {
    try {
      const response = await api.get('/employees');
      const empData = response.data.employees || response.data || [];
      setAllEmployees(Array.isArray(empData) ? empData : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll');
      const payrollData = response.data.payrolls || response.data || [];
      setPayrolls(Array.isArray(payrollData) ? payrollData : []);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      toast.error('Failed to load payroll data');
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  };

  const getEmployeeName = (emp) => {
    if (!emp) return 'Unknown';
    if (emp.name) return emp.name;
    if (emp.firstName && emp.lastName) return `${emp.firstName} ${emp.lastName}`;
    return emp.firstName || 'Unknown';
  };

  const downloadPayslip = (payroll) => {
    const empName = getEmployeeName(payroll.employee);
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${getMonthName(payroll.month)} ${payroll.year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #667eea; }
          .payslip-title { font-size: 16px; margin-top: 10px; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .info-item { font-size: 14px; }
          .info-label { color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background-color: #667eea; color: white; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
          .net-salary { font-size: 22px; color: #667eea; margin-top: 20px; text-align: right; padding: 15px; background: #f0f4ff; border-radius: 8px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">DayFlow HR</div>
          <div class="payslip-title">Salary Slip for ${getMonthName(payroll.month)} ${payroll.year}</div>
        </div>
        
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Employee Name:</span> <strong>${empName}</strong></div>
          <div class="info-item"><span class="info-label">Employee ID:</span> <strong>${payroll.employee?.employeeId || 'N/A'}</strong></div>
          <div class="info-item"><span class="info-label">Department:</span> <strong>${payroll.employee?.department || 'N/A'}</strong></div>
          <div class="info-item"><span class="info-label">Status:</span> <strong>${payroll.paymentStatus}</strong></div>
        </div>

        <table>
          <thead><tr><th>Earnings</th><th style="text-align: right;">Amount</th></tr></thead>
          <tbody>
            <tr><td>Basic Salary</td><td style="text-align: right;">${formatCurrency(payroll.basicSalary)}</td></tr>
            <tr><td>House Rent Allowance</td><td style="text-align: right;">${formatCurrency(payroll.allowances?.hra || 0)}</td></tr>
            <tr><td>Transport Allowance</td><td style="text-align: right;">${formatCurrency(payroll.allowances?.transport || 0)}</td></tr>
            <tr><td>Medical Allowance</td><td style="text-align: right;">${formatCurrency(payroll.allowances?.medical || 0)}</td></tr>
            ${payroll.bonuses > 0 ? `<tr><td>Bonuses</td><td style="text-align: right;">${formatCurrency(payroll.bonuses)}</td></tr>` : ''}
            <tr class="total-row"><td>Gross Salary</td><td style="text-align: right;">${formatCurrency(payroll.grossSalary)}</td></tr>
          </tbody>
        </table>

        <table>
          <thead><tr><th>Deductions</th><th style="text-align: right;">Amount</th></tr></thead>
          <tbody>
            <tr><td>Income Tax (TDS)</td><td style="text-align: right;">${formatCurrency(payroll.deductions?.tax || 0)}</td></tr>
            <tr><td>Provident Fund</td><td style="text-align: right;">${formatCurrency(payroll.deductions?.providentFund || 0)}</td></tr>
            <tr><td>Insurance</td><td style="text-align: right;">${formatCurrency(payroll.deductions?.insurance || 0)}</td></tr>
            <tr class="total-row"><td>Total Deductions</td><td style="text-align: right;">${formatCurrency(
              (payroll.deductions?.tax || 0) + (payroll.deductions?.providentFund || 0) + 
              (payroll.deductions?.insurance || 0) + (payroll.deductions?.other || 0)
            )}</td></tr>
          </tbody>
        </table>

        <div class="net-salary"><strong>Net Salary: ${formatCurrency(payroll.netSalary)}</strong></div>
        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>DayFlow HR Management System</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([payslipHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${empName.replace(/\s+/g, '_')}_${getMonthName(payroll.month)}_${payroll.year}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Payslip downloaded!');
  };

  const handleSavePayroll = async (formData) => {
    try {
      if (editingPayroll) {
        await api.put(`/payroll/${editingPayroll._id}`, formData);
        toast.success('Payroll updated successfully');
      } else {
        await api.post('/payroll', formData);
        toast.success('Payroll created successfully');
      }
      fetchPayrolls();
      setShowModal(false);
      setEditingPayroll(null);
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast.error(error.response?.data?.message || 'Failed to save payroll');
    }
  };

  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      toast.success('Payroll deleted');
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to delete payroll');
    }
  };

  // Get available years from payroll data
  const availableYears = payrolls.length > 0 
    ? [...new Set(payrolls.map(p => p.year))].sort((a, b) => b - a)
    : [new Date().getFullYear()];

  // Filter payrolls
  const filteredPayrolls = payrolls.filter(p => {
    if (p.year !== selectedYear) return false;
    if (statusFilter !== 'all' && p.paymentStatus?.toLowerCase() !== statusFilter) return false;
    if (searchQuery) {
      const empName = getEmployeeName(p.employee).toLowerCase();
      const empId = p.employee?.employeeId?.toLowerCase() || '';
      if (!empName.includes(searchQuery.toLowerCase()) && !empId.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Stats for admin
  const stats = {
    totalPayrolls: filteredPayrolls.length,
    totalPaid: filteredPayrolls.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + (p.netSalary || 0), 0),
    pending: filteredPayrolls.filter(p => p.paymentStatus === 'Pending').length,
    processed: filteredPayrolls.filter(p => p.paymentStatus === 'Processed').length
  };

  // Get latest payroll for employee view
  const myPayrolls = payrolls.filter(p => p.year === selectedYear);
  const latestPayroll = myPayrolls[0];

  if (loading) {
    return (
      <Layout>
        <div className="payroll-loading">
          <div className="spinner"></div>
          <p>Loading payroll data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="payroll-page">
        {/* Admin View */}
        {isAdmin ? (
          <>
            <div className="payroll-header">
              <div>
                <h1>Payroll Management</h1>
                <p>Manage employee salaries and payment records</p>
              </div>
              <button className="btn-primary" onClick={() => { setEditingPayroll(null); setShowModal(true); }}>
                <Plus size={18} />
                Create Payroll
              </button>
            </div>

            {/* Stats Cards */}
            <div className="payroll-stats">
              <div className="stat-card">
                <div className="stat-icon blue"><FileText size={24} /></div>
                <div className="stat-info">
                  <h3>{stats.totalPayrolls}</h3>
                  <p>Total Records</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><Check size={24} /></div>
                <div className="stat-info">
                  <h3>{formatCurrency(stats.totalPaid)}</h3>
                  <p>Total Paid</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><AlertCircle size={24} /></div>
                <div className="stat-info">
                  <h3>{stats.pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple"><TrendingUp size={24} /></div>
                <div className="stat-info">
                  <h3>{stats.processed}</h3>
                  <p>Processed</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="payroll-filters">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="filter-select">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Payroll Table */}
            <div className="payroll-table-container">
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Basic</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-row">
                        <FileText size={40} />
                        <p>No payroll records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map(payroll => {
                      const totalAllowances = (payroll.allowances?.hra || 0) + (payroll.allowances?.transport || 0) + 
                        (payroll.allowances?.medical || 0) + (payroll.allowances?.other || 0);
                      const totalDeductions = (payroll.deductions?.tax || 0) + (payroll.deductions?.providentFund || 0) + 
                        (payroll.deductions?.insurance || 0) + (payroll.deductions?.other || 0);
                      
                      return (
                        <tr key={payroll._id}>
                          <td>
                            <div className="employee-info">
                              <div className="avatar">{getEmployeeName(payroll.employee).charAt(0)}</div>
                              <div>
                                <div className="emp-name">{getEmployeeName(payroll.employee)}</div>
                                <div className="emp-id">{payroll.employee?.employeeId || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>{getMonthName(payroll.month)} {payroll.year}</td>
                          <td>{formatCurrency(payroll.basicSalary)}</td>
                          <td>{formatCurrency(totalAllowances)}</td>
                          <td>{formatCurrency(totalDeductions)}</td>
                          <td className="net-salary">{formatCurrency(payroll.netSalary)}</td>
                          <td>
                            <span className={`status-badge ${payroll.paymentStatus?.toLowerCase()}`}>
                              {payroll.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button onClick={() => downloadPayslip(payroll)} title="Download">
                                <Download size={16} />
                              </button>
                              <button onClick={() => { setEditingPayroll(payroll); setShowModal(true); }} title="Edit">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeletePayroll(payroll._id)} className="delete" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Employee View */
          <>
            <div className="payroll-header">
              <div>
                <h1>My Payroll</h1>
                <p>View your salary and payment history</p>
              </div>
            </div>

            {/* Current Salary Card */}
            {latestPayroll && (
              <div className="salary-overview">
                <div className="main-salary-card">
                  <div className="salary-header">
                    <div>
                      <h3>Current Net Salary</h3>
                      <p>{getMonthName(latestPayroll.month)} {latestPayroll.year}</p>
                    </div>
                    <span className={`status-badge ${latestPayroll.paymentStatus?.toLowerCase()}`}>
                      {latestPayroll.paymentStatus}
                    </span>
                  </div>
                  <div className="salary-amount">{formatCurrency(latestPayroll.netSalary)}</div>
                  <button className="download-btn" onClick={() => downloadPayslip(latestPayroll)}>
                    <Download size={16} /> Download Payslip
                  </button>
                </div>

                <div className="salary-breakdown">
                  <div className="breakdown-section">
                    <h4><ArrowUp size={16} /> Earnings</h4>
                    <div className="breakdown-item">
                      <span>Basic Salary</span>
                      <span className="positive">{formatCurrency(latestPayroll.basicSalary)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>HRA</span>
                      <span className="positive">{formatCurrency(latestPayroll.allowances?.hra || 0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Transport</span>
                      <span className="positive">{formatCurrency(latestPayroll.allowances?.transport || 0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Medical</span>
                      <span className="positive">{formatCurrency(latestPayroll.allowances?.medical || 0)}</span>
                    </div>
                    {latestPayroll.bonuses > 0 && (
                      <div className="breakdown-item">
                        <span>Bonuses</span>
                        <span className="positive">{formatCurrency(latestPayroll.bonuses)}</span>
                      </div>
                    )}
                    <div className="breakdown-item total">
                      <span>Gross Salary</span>
                      <span className="positive">{formatCurrency(latestPayroll.grossSalary)}</span>
                    </div>
                  </div>

                  <div className="breakdown-section">
                    <h4><ArrowDown size={16} /> Deductions</h4>
                    <div className="breakdown-item">
                      <span>Income Tax</span>
                      <span className="negative">{formatCurrency(latestPayroll.deductions?.tax || 0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Provident Fund</span>
                      <span className="negative">{formatCurrency(latestPayroll.deductions?.providentFund || 0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Insurance</span>
                      <span className="negative">{formatCurrency(latestPayroll.deductions?.insurance || 0)}</span>
                    </div>
                    <div className="breakdown-item total">
                      <span>Total Deductions</span>
                      <span className="negative">{formatCurrency(
                        (latestPayroll.deductions?.tax || 0) + (latestPayroll.deductions?.providentFund || 0) +
                        (latestPayroll.deductions?.insurance || 0) + (latestPayroll.deductions?.other || 0)
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            <div className="payment-history">
              <div className="history-header">
                <h2><FileText size={20} /> Payment History</h2>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="year-select">
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              
              <div className="history-grid">
                {myPayrolls.length === 0 ? (
                  <div className="empty-history">
                    <FileText size={48} />
                    <p>No payroll records for {selectedYear}</p>
                  </div>
                ) : (
                  myPayrolls.map(payroll => (
                    <div key={payroll._id} className="history-card">
                      <div className="history-card-header">
                        <span className="month">{getMonthName(payroll.month)} {payroll.year}</span>
                        <span className={`status-badge ${payroll.paymentStatus?.toLowerCase()}`}>
                          {payroll.paymentStatus}
                        </span>
                      </div>
                      <div className="history-card-amount">{formatCurrency(payroll.netSalary)}</div>
                      <div className="history-card-details">
                        <span>Gross: {formatCurrency(payroll.grossSalary)}</span>
                        <span>Deductions: {formatCurrency(
                          (payroll.deductions?.tax || 0) + (payroll.deductions?.providentFund || 0) +
                          (payroll.deductions?.insurance || 0) + (payroll.deductions?.other || 0)
                        )}</span>
                      </div>
                      <button className="download-btn small" onClick={() => downloadPayslip(payroll)}>
                        <Download size={14} /> Download
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <PayrollModal
            payroll={editingPayroll}
            employees={allEmployees}
            onSave={handleSavePayroll}
            onClose={() => { setShowModal(false); setEditingPayroll(null); }}
            formatCurrency={formatCurrency}
            getMonthName={getMonthName}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal Component
const PayrollModal = ({ payroll, employees, onSave, onClose, getMonthName }) => {
  const [formData, setFormData] = useState({
    employee: payroll?.employee?._id || '',
    month: payroll?.month || new Date().getMonth() + 1,
    year: payroll?.year || new Date().getFullYear(),
    basicSalary: payroll?.basicSalary || 50000,
    allowances: {
      hra: payroll?.allowances?.hra || 0,
      transport: payroll?.allowances?.transport || 0,
      medical: payroll?.allowances?.medical || 0,
      other: payroll?.allowances?.other || 0
    },
    deductions: {
      tax: payroll?.deductions?.tax || 0,
      providentFund: payroll?.deductions?.providentFund || 0,
      insurance: payroll?.deductions?.insurance || 0,
      other: payroll?.deductions?.other || 0
    },
    bonuses: payroll?.bonuses || 0,
    paymentStatus: payroll?.paymentStatus || 'Pending'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: parseFloat(value) || 0 }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{payroll ? 'Edit Payroll' : 'Create Payroll'}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Employee *</label>
              <select 
                value={formData.employee} 
                onChange={(e) => handleChange('employee', e.target.value)}
                required
                disabled={!!payroll}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Month *</label>
              <select value={formData.month} onChange={(e) => handleChange('month', parseInt(e.target.value))} disabled={!!payroll}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Year *</label>
              <input type="number" value={formData.year} onChange={(e) => handleChange('year', parseInt(e.target.value))} disabled={!!payroll} />
            </div>
            
            <div className="form-group">
              <label>Basic Salary *</label>
              <input type="number" value={formData.basicSalary} onChange={(e) => handleChange('basicSalary', parseFloat(e.target.value))} required />
            </div>
          </div>

          <h4>Allowances</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>HRA</label>
              <input type="number" value={formData.allowances.hra} onChange={(e) => handleNestedChange('allowances', 'hra', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Transport</label>
              <input type="number" value={formData.allowances.transport} onChange={(e) => handleNestedChange('allowances', 'transport', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Medical</label>
              <input type="number" value={formData.allowances.medical} onChange={(e) => handleNestedChange('allowances', 'medical', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bonuses</label>
              <input type="number" value={formData.bonuses} onChange={(e) => handleChange('bonuses', parseFloat(e.target.value))} />
            </div>
          </div>

          <h4>Deductions</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Tax</label>
              <input type="number" value={formData.deductions.tax} onChange={(e) => handleNestedChange('deductions', 'tax', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Provident Fund</label>
              <input type="number" value={formData.deductions.providentFund} onChange={(e) => handleNestedChange('deductions', 'providentFund', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Insurance</label>
              <input type="number" value={formData.deductions.insurance} onChange={(e) => handleNestedChange('deductions', 'insurance', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={formData.paymentStatus} onChange={(e) => handleChange('paymentStatus', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Processed">Processed</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Save size={18} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollManagement;
