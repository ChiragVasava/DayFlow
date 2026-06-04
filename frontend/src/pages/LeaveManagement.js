import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const { employee } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leave');
      setLeaves(response.data.leaves);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/leave', formData);
      toast.success('Leave request submitted successfully');
      setShowModal(false);
      setFormData({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return;
    }

    try {
      await api.delete(`/leave/${id}`);
      toast.success('Leave request deleted');
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete leave request');
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

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved');
  const rejectedLeaves = leaves.filter((l) => l.status === 'Rejected');

  return (
    <Layout>
      <div className="leave-page">
        <div className="page-header">
          <div>
            <h1>Leave Management</h1>
            <p>Manage your time-off requests</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Request Leave
          </button>
        </div>

        {/* Leave Balance */}
        <div className="leave-balance-cards">
          <div className="balance-card">
            <h3>Paid Leave</h3>
            <p className="balance-number">{employee.leaveBalance?.paid || 0}</p>
            <p className="balance-label">days remaining</p>
          </div>
          <div className="balance-card">
            <h3>Sick Leave</h3>
            <p className="balance-number">{employee.leaveBalance?.sick || 0}</p>
            <p className="balance-label">days remaining</p>
          </div>
        </div>

        {/* Leave Stats */}
        <div className="leave-stats">
          <div className="stat-box">
            <p className="stat-count">{pendingLeaves.length}</p>
            <p className="stat-label">Pending</p>
          </div>
          <div className="stat-box">
            <p className="stat-count">{approvedLeaves.length}</p>
            <p className="stat-label">Approved</p>
          </div>
          <div className="stat-box">
            <p className="stat-count">{rejectedLeaves.length}</p>
            <p className="stat-label">Rejected</p>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="card">
          <h2 className="card-title">Leave Requests</h2>
          
          {leaves.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <span className="badge badge-info">{leave.leaveType}</span>
                      </td>
                      <td>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</td>
                      <td>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</td>
                      <td>{leave.numberOfDays}</td>
                      <td className="reason-cell">{leave.reason}</td>
                      <td>
                        <span className={`badge badge-${
                          leave.status === 'Approved' ? 'success' : 
                          leave.status === 'Rejected' ? 'danger' : 'warning'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="remarks-cell">
                        {leave.reviewComments || (leave.status === 'Pending' ? '—' : 'No remarks')}
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

        {/* Apply Leave Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request Leave</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="leaveType">Leave Type</label>
                  <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Paid">Paid Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Please provide a reason for your leave request..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeaveManagement;
