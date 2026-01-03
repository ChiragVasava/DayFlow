import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Calendar, FileText, TrendingUp, Building2, UserPlus, X } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    recentLeaves: [],
    departmentBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  
  // Leave action modal state
  const [leaveModal, setLeaveModal] = useState({
    isOpen: false,
    leave: null,
    action: null,
    remarks: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance', {
          params: {
            startDate: today.toISOString(),
            endDate: today.toISOString(),
          },
        }),
        api.get('/leave'),
      ]);

      const presentToday = attendanceRes.data.attendance.filter(
        (a) => a.status === 'Present'
      ).length;

      const pendingLeaves = leavesRes.data.leaves.filter(
        (l) => l.status === 'Pending'
      ).length;

      // Calculate department breakdown
      const departmentBreakdown = {};
      employeesRes.data.employees.forEach((emp) => {
        const dept = emp.department || 'Unassigned';
        departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
      });

      setStats({
        totalEmployees: employeesRes.data.count,
        presentToday,
        pendingLeaves,
        recentLeaves: leavesRes.data.leaves.filter(l => l.status === 'Pending').slice(0, 5),
        departmentBreakdown,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const openLeaveModal = (leave, action) => {
    setLeaveModal({
      isOpen: true,
      leave,
      action,
      remarks: '',
    });
  };

  const closeLeaveModal = () => {
    setLeaveModal({
      isOpen: false,
      leave: null,
      action: null,
      remarks: '',
    });
  };

  const handleLeaveAction = async () => {
    try {
      await api.put(`/leave/${leaveModal.leave._id}/review`, {
        status: leaveModal.action,
        reviewComments: leaveModal.remarks || `${leaveModal.action} by admin`,
      });
      toast.success(`Leave ${leaveModal.action.toLowerCase()} successfully`);
      closeLeaveModal();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave');
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

  return (
    <Layout>
      <div className="dashboard">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard 📊</h1>
            <p>Overview of your organization's HR metrics.</p>
          </div>
          <button 
            className="create-employee-btn" 
            onClick={() => navigate('/create-employee')}
          >
            <UserPlus size={20} />
            Create Employee
          </button>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Employees</p>
              <p className="stat-value">{stats.totalEmployees}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>
              <Calendar size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Present Today</p>
              <p className="stat-value">{stats.presentToday}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <FileText size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending Leave Requests</p>
              <p className="stat-value">{stats.pendingLeaves}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>
              <TrendingUp size={24} color="#6366f1" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Attendance Rate</p>
              <p className="stat-value">
                {stats.totalEmployees > 0 
                  ? Math.round((stats.presentToday / stats.totalEmployees) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card">
          <h2 className="card-title">
            <Building2 size={20} />
            Department Breakdown
          </h2>
          
          {Object.keys(stats.departmentBreakdown).length > 0 ? (
            <div className="department-grid">
              {Object.entries(stats.departmentBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([department, count]) => (
                  <div key={department} className="department-card">
                    <div className="department-name">{department}</div>
                    <div className="department-count">{count} employee{count !== 1 ? 's' : ''}</div>
                    <div className="department-bar">
                      <div 
                        className="department-bar-fill"
                        style={{ 
                          width: `${(count / stats.totalEmployees) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="empty-state">No department data available.</p>
          )}
        </div>

        {/* Pending Leave Requests */}
        <div className="card">
          <h2 className="card-title">Pending Leave Requests</h2>
          
          {stats.recentLeaves.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div>
                          <strong>{leave.employee?.firstName} {leave.employee?.lastName}</strong>
                          {leave.employee?.designation && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {leave.employee?.designation}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {leave.employee?.department || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{leave.leaveType}</span>
                      </td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td>{leave.numberOfDays}</td>
                      <td className="reason-cell">{leave.reason}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon btn-success"
                            onClick={() => openLeaveModal(leave, 'Approved')}
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button 
                            className="btn-icon btn-danger"
                            onClick={() => openLeaveModal(leave, 'Rejected')}
                            title="Reject"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No pending leave requests.</p>
          )}
        </div>

        {/* Leave Action Modal */}
        {leaveModal.isOpen && (
          <div className="modal-overlay" onClick={closeLeaveModal}>
            <div className="modal-content leave-action-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{leaveModal.action === 'Approved' ? 'Approve' : 'Reject'} Leave Request</h2>
                <button className="close-btn" onClick={closeLeaveModal}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="leave-details-summary">
                  <p><strong>Employee:</strong> {leaveModal.leave?.employee?.firstName} {leaveModal.leave?.employee?.lastName}</p>
                  <p><strong>Leave Type:</strong> {leaveModal.leave?.leaveType}</p>
                  <p><strong>Dates:</strong> {new Date(leaveModal.leave?.startDate).toLocaleDateString()} - {new Date(leaveModal.leave?.endDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {leaveModal.leave?.reason}</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="remarks">
                    Remarks <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(optional)</span>
                  </label>
                  <textarea
                    id="remarks"
                    value={leaveModal.remarks}
                    onChange={(e) => setLeaveModal({ ...leaveModal, remarks: e.target.value })}
                    placeholder={`Enter your remarks for ${leaveModal.action === 'Approved' ? 'approving' : 'rejecting'} this leave request...`}
                    rows={4}
                    className="remarks-textarea"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeLeaveModal}>
                  Cancel
                </button>
                <button 
                  className={`btn-primary ${leaveModal.action === 'Approved' ? 'btn-approve' : 'btn-reject'}`}
                  onClick={handleLeaveAction}
                >
                  {leaveModal.action === 'Approved' ? 'Approve' : 'Reject'} Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
