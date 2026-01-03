import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Phone, Briefcase, Building2, Calendar, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import './EmployeeDetail.css';

const EmployeeDetail = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <Layout>
            <div className="employee-detail-page">
                <div className="detail-header">
                    <button className="back-button" onClick={() => navigate('/employees')}>
                        <ArrowLeft size={20} />
                        Back to Employees
                    </button>
                </div>

                <div className="detail-card">
                    <div className="detail-avatar">
                        {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                    </div>

                    <div className="detail-main">
                        <h1 className="employee-full-name">
                            {employee?.firstName} {employee?.lastName}
                        </h1>
                        <p className="employee-id-main">ID: {employee?.employeeId}</p>

                        <div className="status-container">
                            <span className={`status-badge ${employee?.isActive ? 'active' : 'inactive'}`}>
                                {employee?.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`role-badge role-${employee?.role?.toLowerCase()}`}>
                                {employee?.role}
                            </span>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Mail size={20} />
                                </div>
                                <div className="detail-content">
                                    <label>Email</label>
                                    <p>{employee?.email}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Phone size={20} />
                                </div>
                                <div className="detail-content">
                                    <label>Phone</label>
                                    <p>{employee?.phoneNumber || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Building2 size={20} />
                                </div>
                                <div className="detail-content">
                                    <label>Department</label>
                                    <p>{employee?.department || 'Not assigned'}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Briefcase size={20} />
                                </div>
                                <div className="detail-content">
                                    <label>Position</label>
                                    <p>{employee?.designation || 'Not assigned'}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Calendar size={20} />
                                </div>
                                <div className="detail-content">
                                    <label>Date of Joining</label>
                                    <p>{employee?.dateOfJoining ? format(new Date(employee.dateOfJoining), 'MMMM dd, yyyy') : 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <UserCheck size={20} />
                                </div>
                                <div className="detail-content">
                                    <label>Account Status</label>
                                    <p>{employee?.isActive ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmployeeDetail;
