import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  DollarSign, TrendingUp, Calendar, Download, Plus, 
  Edit, Trash2, Search, X, Save, Check, AlertCircle,
  FileText, ArrowUp, ArrowDown, Clock, UserCheck, 
  CalendarX, Coffee, Briefcase, Calculator, Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import './PayrollManagement.css';

const PayrollManagement = () => {
  const { employee } = useAuth();
  const [activeTab, setActiveTab] = useState('payroll');
  const [payrolls, setPayrolls] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Payslip generator state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedPayslipYear, setSelectedPayslipYear] = useState(new Date().getFullYear());
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [generatedPayslip, setGeneratedPayslip] = useState(null);
  const [generatingPayslip, setGeneratingPayslip] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState(null);

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

  const fetchAttendanceSummary = async () => {
    if (!selectedEmployee || !selectedMonth || !selectedPayslipYear) {
      toast.error('Please select employee, month, and year');
      return;
    }
    
    try {
      const response = await api.get(`/payroll/attendance-summary/${selectedEmployee}/${selectedMonth}/${selectedPayslipYear}`);
      setAttendanceSummary(response.data.summary);
      setGeneratedPayslip(null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance data');
    }
  };

  const generatePayslip = async () => {
    if (!selectedEmployee || !selectedMonth || !selectedPayslipYear) {
      toast.error('Please select employee, month, and year');
      return;
    }
    
    setGeneratingPayslip(true);
    try {
      const response = await api.post('/payroll/generate-payslip', {
        employeeId: selectedEmployee,
        month: selectedMonth,
        year: selectedPayslipYear
      });
      
      setGeneratedPayslip(response.data.payroll);
      setAttendanceSummary(response.data.attendanceDetails);
      toast.success('Payslip generated successfully!');
      fetchPayrolls(); // Refresh the payroll list
    } catch (error) {
      console.error('Error generating payslip:', error);
      toast.error(error.response?.data?.message || 'Failed to generate payslip');
    } finally {
      setGeneratingPayslip(false);
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
    const summary = payroll.attendanceSummary || {};
    
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${getMonthName(payroll.month)} ${payroll.year}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; background: #f5f5f5; }
          .payslip { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
          .company-name { font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
          .payslip-title { font-size: 18px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; background: linear-gradient(135deg, #f8f9ff, #f0f4ff); padding: 20px; border-radius: 10px; }
          .info-item { font-size: 14px; }
          .info-label { color: #666; font-weight: 500; }
          .info-value { font-weight: 600; color: #333; }
          
          .attendance-section { background: #fff8f0; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #f59e0b; }
          .attendance-title { font-size: 16px; font-weight: 600; color: #92400e; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
          .attendance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .attendance-item { text-align: center; padding: 12px; background: white; border-radius: 8px; }
          .attendance-item .value { font-size: 24px; font-weight: bold; color: #667eea; }
          .attendance-item .label { font-size: 12px; color: #666; margin-top: 4px; }
          
          .tables-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
          th, td { padding: 12px 15px; text-align: left; }
          th { background: #667eea; color: white; font-weight: 600; font-size: 14px; }
          td { border-bottom: 1px solid #eee; font-size: 14px; }
          .amount { text-align: right; font-weight: 500; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .total-row { background: #f3f4f6; font-weight: 600; }
          
          .net-salary-section { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 12px; margin-top: 25px; display: flex; justify-content: space-between; align-items: center; }
          .net-salary-label { font-size: 18px; opacity: 0.9; }
          .net-salary-amount { font-size: 36px; font-weight: bold; }
          
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ddd; text-align: center; color: #888; font-size: 12px; }
          .footer p { margin: 5px 0; }
          
          @media print { body { background: white; padding: 0; } .payslip { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <div class="company-name">🌟 DayFlow HR</div>
            <div class="payslip-title">Salary Slip - ${getMonthName(payroll.month)} ${payroll.year}</div>
          </div>
          
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Employee Name:</span> <span class="info-value">${empName}</span></div>
            <div class="info-item"><span class="info-label">Employee ID:</span> <span class="info-value">${payroll.employee?.employeeId || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Department:</span> <span class="info-value">${payroll.employee?.department || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Payment Status:</span> <span class="info-value">${payroll.paymentStatus}</span></div>
          </div>

          <div class="attendance-section">
            <div class="attendance-title">📊 Attendance Summary</div>
            <div class="attendance-grid">
              <div class="attendance-item">
                <div class="value">${summary.totalWorkingDays || 22}</div>
                <div class="label">Working Days</div>
              </div>
              <div class="attendance-item">
                <div class="value">${summary.presentDays || 0}</div>
                <div class="label">Present Days</div>
              </div>
              <div class="attendance-item">
                <div class="value">${summary.halfDays || 0}</div>
                <div class="label">Half Days</div>
              </div>
              <div class="attendance-item">
                <div class="value">${(summary.paidLeaves || 0) + (summary.sickLeaves || 0)}</div>
                <div class="label">Paid Leaves</div>
              </div>
              <div class="attendance-item">
                <div class="value">${summary.unpaidLeaves || 0}</div>
                <div class="label">Unpaid Leaves</div>
              </div>
              <div class="attendance-item">
                <div class="value">${summary.absentDays || 0}</div>
                <div class="label">Absent Days</div>
              </div>
              <div class="attendance-item">
                <div class="value">${summary.lateArrivals || 0}</div>
                <div class="label">Late Arrivals</div>
              </div>
              <div class="attendance-item">
                <div class="value">${summary.overtimeHours || 0}h</div>
                <div class="label">Overtime</div>
              </div>
            </div>
          </div>

          <div class="tables-container">
            <table>
              <thead><tr><th colspan="2">💰 Earnings</th></tr></thead>
              <tbody>
                <tr><td>Basic Salary</td><td class="amount positive">${formatCurrency(payroll.basicSalary)}</td></tr>
                <tr><td>House Rent Allowance</td><td class="amount positive">${formatCurrency(payroll.allowances?.hra || 0)}</td></tr>
                <tr><td>Transport Allowance</td><td class="amount positive">${formatCurrency(payroll.allowances?.transport || 0)}</td></tr>
                <tr><td>Medical Allowance</td><td class="amount positive">${formatCurrency(payroll.allowances?.medical || 0)}</td></tr>
                ${payroll.bonuses > 0 ? `<tr><td>Bonuses</td><td class="amount positive">${formatCurrency(payroll.bonuses)}</td></tr>` : ''}
                ${payroll.overtimePay > 0 ? `<tr><td>Overtime Pay</td><td class="amount positive">${formatCurrency(payroll.overtimePay)}</td></tr>` : ''}
                <tr class="total-row"><td>Gross Salary</td><td class="amount positive">${formatCurrency(payroll.grossSalary)}</td></tr>
              </tbody>
            </table>

            <table>
              <thead><tr><th colspan="2">📉 Deductions</th></tr></thead>
              <tbody>
                <tr><td>Income Tax (TDS)</td><td class="amount negative">${formatCurrency(payroll.deductions?.tax || 0)}</td></tr>
                <tr><td>Provident Fund</td><td class="amount negative">${formatCurrency(payroll.deductions?.providentFund || 0)}</td></tr>
                <tr><td>Insurance</td><td class="amount negative">${formatCurrency(payroll.deductions?.insurance || 0)}</td></tr>
                ${payroll.lopDeduction > 0 ? `<tr><td>LOP Deduction (${payroll.lopDays} days)</td><td class="amount negative">${formatCurrency(payroll.lopDeduction)}</td></tr>` : ''}
                ${payroll.deductions?.other > 0 ? `<tr><td>Late Arrival Penalty</td><td class="amount negative">${formatCurrency(payroll.deductions?.other)}</td></tr>` : ''}
                <tr class="total-row"><td>Total Deductions</td><td class="amount negative">${formatCurrency(
                  (payroll.deductions?.tax || 0) + (payroll.deductions?.providentFund || 0) + 
                  (payroll.deductions?.insurance || 0) + (payroll.deductions?.other || 0) + (payroll.lopDeduction || 0)
                )}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="net-salary-section">
            <div class="net-salary-label">Net Salary Payable</div>
            <div class="net-salary-amount">${formatCurrency(payroll.netSalary)}</div>
          </div>

          <div class="footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            <p><strong>DayFlow HR Management System</strong></p>
          </div>
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
              <div className="header-actions">
                <div className="tabs">
                  <button 
                    className={`tab ${activeTab === 'payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payroll')}
                  >
                    <FileText size={18} /> Payroll Records
                  </button>
                  <button 
                    className={`tab ${activeTab === 'payslip' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payslip')}
                  >
                    <Receipt size={18} /> Generate Payslip
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'payroll' ? (
              <>
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
                  <button className="btn-primary" onClick={() => { setEditingPayroll(null); setShowModal(true); }}>
                    <Plus size={18} />
                    Create Payroll
                  </button>
                </div>

                {/* Payroll Table */}
                <div className="payroll-table-container">
                  <table className="payroll-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Period</th>
                        <th>Basic</th>
                        <th>Attendance</th>
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
                          const summary = payroll.attendanceSummary || {};
                          const totalDeductions = (payroll.deductions?.tax || 0) + (payroll.deductions?.providentFund || 0) + 
                            (payroll.deductions?.insurance || 0) + (payroll.deductions?.other || 0) + (payroll.lopDeduction || 0);
                          
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
                              <td>
                                <div className="attendance-mini">
                                  <span className="present" title="Present">{summary.presentDays || '-'}</span>/
                                  <span className="half" title="Half-day">{summary.halfDays || 0}</span>/
                                  <span className="absent" title="Absent/LOP">{payroll.lopDays || 0}</span>
                                </div>
                              </td>
                              <td className="deduction">{formatCurrency(totalDeductions)}</td>
                              <td className="net-salary">{formatCurrency(payroll.netSalary)}</td>
                              <td>
                                <span className={`status-badge ${payroll.paymentStatus?.toLowerCase()}`}>
                                  {payroll.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <div className="action-btns">
                                  <button onClick={() => setViewingPayslip(payroll)} title="View Payslip">
                                    <FileText size={16} />
                                  </button>
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
              /* Payslip Generator Tab */
              <div className="payslip-generator">
                <div className="generator-card">
                  <h2><Calculator size={24} /> Interactive Payslip Generator</h2>
                  <p>Generate payslip based on attendance, leaves, and overtime</p>
                  
                  <div className="generator-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Select Employee</label>
                        <select 
                          value={selectedEmployee} 
                          onChange={(e) => {
                            setSelectedEmployee(e.target.value);
                            setAttendanceSummary(null);
                            setGeneratedPayslip(null);
                          }}
                        >
                          <option value="">-- Select Employee --</option>
                          {allEmployees.filter(e => e.role !== 'Admin').map(emp => (
                            <option key={emp._id} value={emp._id}>
                              {emp.firstName} {emp.lastName} ({emp.employeeId})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Month</label>
                        <select 
                          value={selectedMonth} 
                          onChange={(e) => {
                            setSelectedMonth(parseInt(e.target.value));
                            setAttendanceSummary(null);
                            setGeneratedPayslip(null);
                          }}
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <option key={m} value={m}>{getMonthName(m)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Year</label>
                        <select 
                          value={selectedPayslipYear} 
                          onChange={(e) => {
                            setSelectedPayslipYear(parseInt(e.target.value));
                            setAttendanceSummary(null);
                            setGeneratedPayslip(null);
                          }}
                        >
                          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="generator-actions">
                      <button className="btn-secondary" onClick={fetchAttendanceSummary}>
                        <Search size={18} /> Preview Attendance
                      </button>
                      <button 
                        className="btn-primary" 
                        onClick={generatePayslip}
                        disabled={generatingPayslip || !selectedEmployee}
                      >
                        {generatingPayslip ? (
                          <>Generating...</>
                        ) : (
                          <><Calculator size={18} /> Generate Payslip</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Summary Preview */}
                {attendanceSummary && (
                  <div className="attendance-preview">
                    <h3><Calendar size={20} /> Attendance Summary for {getMonthName(selectedMonth)} {selectedPayslipYear}</h3>
                    <div className="attendance-cards">
                      <div className="att-card working">
                        <Briefcase size={24} />
                        <div className="att-value">{attendanceSummary.totalWorkingDays || attendanceSummary.total || 22}</div>
                        <div className="att-label">Working Days</div>
                      </div>
                      <div className="att-card present">
                        <UserCheck size={24} />
                        <div className="att-value">{attendanceSummary.presentDays || attendanceSummary.present || 0}</div>
                        <div className="att-label">Present</div>
                      </div>
                      <div className="att-card half">
                        <Clock size={24} />
                        <div className="att-value">{attendanceSummary.halfDays || attendanceSummary.halfDay || 0}</div>
                        <div className="att-label">Half Days</div>
                      </div>
                      <div className="att-card paid-leave">
                        <Coffee size={24} />
                        <div className="att-value">{(attendanceSummary.paidLeaves || attendanceSummary.paidLeave || 0) + (attendanceSummary.sickLeaves || attendanceSummary.sickLeave || 0)}</div>
                        <div className="att-label">Paid Leaves</div>
                      </div>
                      <div className="att-card unpaid">
                        <CalendarX size={24} />
                        <div className="att-value">{attendanceSummary.unpaidLeaves || attendanceSummary.unpaidLeave || 0}</div>
                        <div className="att-label">Unpaid Leaves</div>
                      </div>
                      <div className="att-card absent">
                        <X size={24} />
                        <div className="att-value">{attendanceSummary.absentDays || attendanceSummary.absent || 0}</div>
                        <div className="att-label">Absent</div>
                      </div>
                      <div className="att-card late">
                        <AlertCircle size={24} />
                        <div className="att-value">{attendanceSummary.lateArrivals || 0}</div>
                        <div className="att-label">Late Arrivals</div>
                      </div>
                      <div className="att-card overtime">
                        <TrendingUp size={24} />
                        <div className="att-value">{attendanceSummary.overtimeHours || 0}h</div>
                        <div className="att-label">Overtime</div>
                      </div>
                    </div>
                    
                    {attendanceSummary.lopDays > 0 && (
                      <div className="lop-warning">
                        <AlertCircle size={18} />
                        <span>Loss of Pay: <strong>{attendanceSummary.lopDays} days</strong> will be deducted from salary</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Generated Payslip Preview */}
                {generatedPayslip && (
                  <div className="payslip-preview">
                    <div className="preview-header">
                      <h3><Receipt size={20} /> Generated Payslip</h3>
                      <button className="btn-primary" onClick={() => downloadPayslip(generatedPayslip)}>
                        <Download size={18} /> Download Payslip
                      </button>
                    </div>
                    
                    <div className="payslip-content">
                      <div className="employee-details">
                        <h4>{getEmployeeName(generatedPayslip.employee)}</h4>
                        <p>{generatedPayslip.employee?.employeeId} • {generatedPayslip.employee?.department}</p>
                        <span className={`status-badge ${generatedPayslip.paymentStatus?.toLowerCase()}`}>
                          {generatedPayslip.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="payslip-breakdown">
                        <div className="breakdown-column earnings">
                          <h5><ArrowUp size={16} /> Earnings</h5>
                          <div className="breakdown-item">
                            <span>Basic Salary</span>
                            <span className="positive">{formatCurrency(generatedPayslip.basicSalary)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>HRA</span>
                            <span className="positive">{formatCurrency(generatedPayslip.allowances?.hra)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Transport</span>
                            <span className="positive">{formatCurrency(generatedPayslip.allowances?.transport)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Medical</span>
                            <span className="positive">{formatCurrency(generatedPayslip.allowances?.medical)}</span>
                          </div>
                          {generatedPayslip.bonuses > 0 && (
                            <div className="breakdown-item">
                              <span>Bonuses</span>
                              <span className="positive">{formatCurrency(generatedPayslip.bonuses)}</span>
                            </div>
                          )}
                          {generatedPayslip.overtimePay > 0 && (
                            <div className="breakdown-item">
                              <span>Overtime Pay</span>
                              <span className="positive">{formatCurrency(generatedPayslip.overtimePay)}</span>
                            </div>
                          )}
                          <div className="breakdown-item total">
                            <span>Gross Salary</span>
                            <span className="positive">{formatCurrency(generatedPayslip.grossSalary)}</span>
                          </div>
                        </div>
                        
                        <div className="breakdown-column deductions">
                          <h5><ArrowDown size={16} /> Deductions</h5>
                          <div className="breakdown-item">
                            <span>Tax (TDS)</span>
                            <span className="negative">{formatCurrency(generatedPayslip.deductions?.tax)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Provident Fund</span>
                            <span className="negative">{formatCurrency(generatedPayslip.deductions?.providentFund)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Insurance</span>
                            <span className="negative">{formatCurrency(generatedPayslip.deductions?.insurance)}</span>
                          </div>
                          {generatedPayslip.lopDeduction > 0 && (
                            <div className="breakdown-item">
                              <span>LOP ({generatedPayslip.lopDays} days)</span>
                              <span className="negative">{formatCurrency(generatedPayslip.lopDeduction)}</span>
                            </div>
                          )}
                          {generatedPayslip.deductions?.other > 0 && (
                            <div className="breakdown-item">
                              <span>Late Penalty</span>
                              <span className="negative">{formatCurrency(generatedPayslip.deductions?.other)}</span>
                            </div>
                          )}
                          <div className="breakdown-item total">
                            <span>Total Deductions</span>
                            <span className="negative">{formatCurrency(
                              (generatedPayslip.deductions?.tax || 0) + 
                              (generatedPayslip.deductions?.providentFund || 0) + 
                              (generatedPayslip.deductions?.insurance || 0) + 
                              (generatedPayslip.deductions?.other || 0) +
                              (generatedPayslip.lopDeduction || 0)
                            )}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="net-salary-box">
                        <span>Net Salary</span>
                        <span className="amount">{formatCurrency(generatedPayslip.netSalary)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                    {latestPayroll.overtimePay > 0 && (
                      <div className="breakdown-item">
                        <span>Overtime Pay</span>
                        <span className="positive">{formatCurrency(latestPayroll.overtimePay)}</span>
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
                    {latestPayroll.lopDeduction > 0 && (
                      <div className="breakdown-item">
                        <span>LOP Deduction</span>
                        <span className="negative">{formatCurrency(latestPayroll.lopDeduction)}</span>
                      </div>
                    )}
                    <div className="breakdown-item total">
                      <span>Total Deductions</span>
                      <span className="negative">{formatCurrency(
                        (latestPayroll.deductions?.tax || 0) + (latestPayroll.deductions?.providentFund || 0) +
                        (latestPayroll.deductions?.insurance || 0) + (latestPayroll.lopDeduction || 0)
                      )}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary for Employee */}
                {latestPayroll.attendanceSummary && (
                  <div className="my-attendance-summary">
                    <h4><Calendar size={16} /> Attendance Summary</h4>
                    <div className="attendance-mini-cards">
                      <div className="mini-card"><span className="value">{latestPayroll.attendanceSummary.presentDays}</span><span className="label">Present</span></div>
                      <div className="mini-card"><span className="value">{latestPayroll.attendanceSummary.halfDays}</span><span className="label">Half Days</span></div>
                      <div className="mini-card"><span className="value">{latestPayroll.attendanceSummary.paidLeaves + latestPayroll.attendanceSummary.sickLeaves}</span><span className="label">Paid Leaves</span></div>
                      <div className="mini-card"><span className="value">{latestPayroll.attendanceSummary.unpaidLeaves}</span><span className="label">Unpaid</span></div>
                      <div className="mini-card"><span className="value">{latestPayroll.attendanceSummary.lateArrivals}</span><span className="label">Late</span></div>
                    </div>
                  </div>
                )}
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
                        {payroll.lopDeduction > 0 && <span className="lop">LOP: {formatCurrency(payroll.lopDeduction)}</span>}
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

        {/* View Payslip Modal */}
        {viewingPayslip && (
          <PayslipViewModal
            payroll={viewingPayslip}
            onClose={() => setViewingPayslip(null)}
            onDownload={downloadPayslip}
            formatCurrency={formatCurrency}
            getMonthName={getMonthName}
            getEmployeeName={getEmployeeName}
          />
        )}
      </div>
    </Layout>
  );
};

// Payslip View Modal Component
const PayslipViewModal = ({ payroll, onClose, onDownload, formatCurrency, getMonthName, getEmployeeName }) => {
  const summary = payroll.attendanceSummary || {};
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payslip-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Receipt size={24} /> Payslip - {getMonthName(payroll.month)} {payroll.year}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="payslip-view-content">
          <div className="payslip-employee-info">
            <div className="emp-avatar">{getEmployeeName(payroll.employee).charAt(0)}</div>
            <div className="emp-details">
              <h3>{getEmployeeName(payroll.employee)}</h3>
              <p>{payroll.employee?.employeeId} • {payroll.employee?.department}</p>
            </div>
            <span className={`status-badge large ${payroll.paymentStatus?.toLowerCase()}`}>
              {payroll.paymentStatus}
            </span>
          </div>
          
          <div className="attendance-summary-section">
            <h4><Calendar size={18} /> Attendance Summary</h4>
            <div className="summary-grid">
              <div><span className="label">Working Days</span><span className="value">{summary.totalWorkingDays || 22}</span></div>
              <div><span className="label">Present</span><span className="value green">{summary.presentDays || 0}</span></div>
              <div><span className="label">Half Days</span><span className="value orange">{summary.halfDays || 0}</span></div>
              <div><span className="label">Paid Leaves</span><span className="value blue">{(summary.paidLeaves || 0) + (summary.sickLeaves || 0)}</span></div>
              <div><span className="label">Unpaid Leaves</span><span className="value red">{summary.unpaidLeaves || 0}</span></div>
              <div><span className="label">Absent</span><span className="value red">{summary.absentDays || 0}</span></div>
              <div><span className="label">Late Arrivals</span><span className="value orange">{summary.lateArrivals || 0}</span></div>
              <div><span className="label">Overtime</span><span className="value green">{summary.overtimeHours || 0}h</span></div>
            </div>
          </div>
          
          <div className="salary-details-grid">
            <div className="earnings-section">
              <h4><ArrowUp size={18} /> Earnings</h4>
              <div className="detail-row"><span>Basic Salary</span><span>{formatCurrency(payroll.basicSalary)}</span></div>
              <div className="detail-row"><span>HRA</span><span>{formatCurrency(payroll.allowances?.hra)}</span></div>
              <div className="detail-row"><span>Transport</span><span>{formatCurrency(payroll.allowances?.transport)}</span></div>
              <div className="detail-row"><span>Medical</span><span>{formatCurrency(payroll.allowances?.medical)}</span></div>
              {payroll.bonuses > 0 && <div className="detail-row"><span>Bonuses</span><span>{formatCurrency(payroll.bonuses)}</span></div>}
              {payroll.overtimePay > 0 && <div className="detail-row"><span>Overtime Pay</span><span>{formatCurrency(payroll.overtimePay)}</span></div>}
              <div className="detail-row total"><span>Gross Salary</span><span>{formatCurrency(payroll.grossSalary)}</span></div>
            </div>
            
            <div className="deductions-section">
              <h4><ArrowDown size={18} /> Deductions</h4>
              <div className="detail-row"><span>Tax (TDS)</span><span>{formatCurrency(payroll.deductions?.tax)}</span></div>
              <div className="detail-row"><span>Provident Fund</span><span>{formatCurrency(payroll.deductions?.providentFund)}</span></div>
              <div className="detail-row"><span>Insurance</span><span>{formatCurrency(payroll.deductions?.insurance)}</span></div>
              {payroll.lopDeduction > 0 && <div className="detail-row lop"><span>LOP ({payroll.lopDays} days)</span><span>{formatCurrency(payroll.lopDeduction)}</span></div>}
              {payroll.deductions?.other > 0 && <div className="detail-row"><span>Late Penalty</span><span>{formatCurrency(payroll.deductions?.other)}</span></div>}
              <div className="detail-row total"><span>Total Deductions</span><span>{formatCurrency(
                (payroll.deductions?.tax || 0) + (payroll.deductions?.providentFund || 0) + 
                (payroll.deductions?.insurance || 0) + (payroll.deductions?.other || 0) + (payroll.lopDeduction || 0)
              )}</span></div>
            </div>
          </div>
          
          <div className="net-salary-display">
            <span>Net Salary</span>
            <span className="amount">{formatCurrency(payroll.netSalary)}</span>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => onDownload(payroll)}>
            <Download size={18} /> Download Payslip
          </button>
        </div>
      </div>
    </div>
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
