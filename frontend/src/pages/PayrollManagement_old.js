import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import './PayrollManagement.css';

const PayrollManagement = () => {
  const { employee } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll');
      setPayrolls(response.data.payrolls);
    } catch (error) {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
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

  const latestPayroll = payrolls[0];

  return (
    <Layout>
      <div className="payroll-page">
        <div className="page-header">
          <h1>Payroll</h1>
          <p>View your salary details and payment history</p>
        </div>

        {latestPayroll && (
          <>
            {/* Current Salary Overview */}
            <div className="salary-overview">
              <div className="salary-card main-card">
                <div className="salary-header">
                  <h3>Net Salary</h3>
                  <span className="salary-period">
                    {getMonthName(latestPayroll.month)} {latestPayroll.year}
                  </span>
                </div>
                <p className="salary-amount">{formatCurrency(latestPayroll.netSalary)}</p>
                <span className={`salary-status status-${latestPayroll.paymentStatus.toLowerCase()}`}>
                  {latestPayroll.paymentStatus}
                </span>
              </div>

              <div className="salary-card">
                <div className="salary-icon" style={{ background: '#dcfce7' }}>
                  <DollarSign size={24} color="#10b981" />
                </div>
                <div>
                  <p className="salary-label">Gross Salary</p>
                  <p className="salary-value">{formatCurrency(latestPayroll.grossSalary)}</p>
                </div>
              </div>

              <div className="salary-card">
                <div className="salary-icon" style={{ background: '#dbeafe' }}>
                  <TrendingUp size={24} color="#3b82f6" />
                </div>
                <div>
                  <p className="salary-label">Allowances</p>
                  <p className="salary-value">
                    {formatCurrency(
                      Object.values(latestPayroll.allowances).reduce((sum, val) => sum + val, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="salary-card">
                <div className="salary-icon" style={{ background: '#fee2e2' }}>
                  <TrendingDown size={24} color="#dc2626" />
                </div>
                <div>
                  <p className="salary-label">Deductions</p>
                  <p className="salary-value">
                    {formatCurrency(
                      Object.values(latestPayroll.deductions).reduce((sum, val) => sum + val, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="salary-breakdown">
              <div className="breakdown-section">
                <h3 className="breakdown-title">Earnings</h3>
                <div className="breakdown-items">
                  <div className="breakdown-item">
                    <span>Basic Salary</span>
                    <span className="amount">{formatCurrency(latestPayroll.basicSalary)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>HRA</span>
                    <span className="amount">{formatCurrency(latestPayroll.allowances.hra)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Transport Allowance</span>
                    <span className="amount">{formatCurrency(latestPayroll.allowances.transport)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Medical Allowance</span>
                    <span className="amount">{formatCurrency(latestPayroll.allowances.medical)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Other Allowances</span>
                    <span className="amount">{formatCurrency(latestPayroll.allowances.other)}</span>
                  </div>
                  {latestPayroll.bonuses > 0 && (
                    <div className="breakdown-item">
                      <span>Bonuses</span>
                      <span className="amount">{formatCurrency(latestPayroll.bonuses)}</span>
                    </div>
                  )}
                  <div className="breakdown-item total">
                    <span>Total Earnings</span>
                    <span className="amount">{formatCurrency(latestPayroll.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="breakdown-section">
                <h3 className="breakdown-title">Deductions</h3>
                <div className="breakdown-items">
                  <div className="breakdown-item">
                    <span>Tax</span>
                    <span className="amount">{formatCurrency(latestPayroll.deductions.tax)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Provident Fund</span>
                    <span className="amount">{formatCurrency(latestPayroll.deductions.providentFund)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Insurance</span>
                    <span className="amount">{formatCurrency(latestPayroll.deductions.insurance)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Other Deductions</span>
                    <span className="amount">{formatCurrency(latestPayroll.deductions.other)}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>Total Deductions</span>
                    <span className="amount">
                      {formatCurrency(
                        Object.values(latestPayroll.deductions).reduce((sum, val) => sum + val, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payroll History */}
        <div className="card">
          <h2 className="card-title">Payroll History</h2>
          
          {payrolls.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Basic Salary</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id}>
                      <td>
                        {getMonthName(payroll.month)} {payroll.year}
                      </td>
                      <td>{formatCurrency(payroll.basicSalary)}</td>
                      <td>{formatCurrency(payroll.grossSalary)}</td>
                      <td className="deduction">
                        {formatCurrency(
                          Object.values(payroll.deductions).reduce((sum, val) => sum + val, 0)
                        )}
                      </td>
                      <td className="net-salary">{formatCurrency(payroll.netSalary)}</td>
                      <td>
                        <span className={`badge badge-${
                          payroll.paymentStatus === 'Paid' ? 'success' : 
                          payroll.paymentStatus === 'Processed' ? 'warning' : 'info'
                        }`}>
                          {payroll.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No payroll records available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PayrollManagement;
