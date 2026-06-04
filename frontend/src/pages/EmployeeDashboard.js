import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, FileText, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const { employee } = useAuth();
  const [stats, setStats] = useState({
    attendance: [],
    leaves: [],
    todayAttendance: null,
  });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const [attendanceRes, leavesRes] = await Promise.all([
        api.get('/attendance', {
          params: {
            startDate: firstDay.toISOString(),
            endDate: lastDay.toISOString(),
          },
        }),
        api.get('/leave'),
      ]);

      const todayAttendance = attendanceRes.data.attendance.find(
        (a) => new Date(a.date).toDateString() === today.toDateString()
      );

      setStats({
        attendance: attendanceRes.data.attendance,
        leaves: leavesRes.data.leaves,
        todayAttendance,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await api.post('/attendance/checkout');
      toast.success('Checked out successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckingIn(false);
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

  const presentDays = stats.attendance.filter((a) => a.status === 'Present').length;
  const pendingLeaves = stats.leaves.filter((l) => l.status === 'Pending').length;

  return (
    <Layout>
      <div className="dashboard">
        <div className="page-header">
          <h1>Welcome back, {employee.firstName}! 👋</h1>
          <p>Here's what's happening with your work today.</p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Calendar size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Present This Month</p>
              <p className="stat-value">{presentDays} days</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <FileText size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending Leaves</p>
              <p className="stat-value">{pendingLeaves}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Paid Leave Balance</p>
              <p className="stat-value">{employee.leaveBalance?.paid || 0} days</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>
              <Clock size={24} color="#6366f1" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Sick Leave Balance</p>
              <p className="stat-value">{employee.leaveBalance?.sick || 0} days</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="card">
          <h2 className="card-title">Today's Attendance</h2>
          
          {stats.todayAttendance ? (
            <div className="attendance-status">
              <div className="status-badge success">
                <CheckCircle size={20} />
                Checked In
              </div>
              <div className="attendance-details">
                <div className="detail-item">
                  <span className="detail-label">Check In:</span>
                  <span className="detail-value">
                    {format(new Date(stats.todayAttendance.checkIn), 'h:mm a')}
                  </span>
                </div>
                {stats.todayAttendance.checkOut && (
                  <div className="detail-item">
                    <span className="detail-label">Check Out:</span>
                    <span className="detail-value">
                      {format(new Date(stats.todayAttendance.checkOut), 'h:mm a')}
                    </span>
                  </div>
                )}
                {stats.todayAttendance.workHours > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Hours:</span>
                    <span className="detail-value">
                      {stats.todayAttendance.workHours.toFixed(2)} hrs
                    </span>
                  </div>
                )}
              </div>
              
              {!stats.todayAttendance.checkOut && (
                <button 
                  className="btn btn-danger"
                  onClick={handleCheckOut}
                  disabled={checkingIn}
                >
                  {checkingIn ? 'Processing...' : 'Check Out'}
                </button>
              )}
            </div>
          ) : (
            <div className="attendance-status">
              <p className="empty-state">You haven't checked in today.</p>
              <button 
                className="btn btn-primary"
                onClick={handleCheckIn}
                disabled={checkingIn}
              >
                {checkingIn ? 'Processing...' : 'Check In Now'}
              </button>
            </div>
          )}
        </div>

        {/* Recent Leave Requests */}
        <div className="card">
          <h2 className="card-title">Recent Leave Requests</h2>
          
          {stats.leaves.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.leaves.slice(0, 5).map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <span className="badge badge-info">{leave.leaveType}</span>
                      </td>
                      <td>
                        {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      </td>
                      <td>{leave.numberOfDays}</td>
                      <td>
                        <span className={`badge badge-${
                          leave.status === 'Approved' ? 'success' : 
                          leave.status === 'Rejected' ? 'danger' : 'warning'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No leave requests yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
