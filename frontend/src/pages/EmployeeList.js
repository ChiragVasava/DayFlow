import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Users, Filter } from 'lucide-react';
import { format } from 'date-fns';
import './EmployeeList.css';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.department?.toLowerCase().includes(searchLower) ||
        emp.designation?.toLowerCase().includes(searchLower);

      const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
      const matchesRole = !roleFilter || emp.role === roleFilter;

      return matchesSearch && matchesDepartment && matchesRole;
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, departmentFilter, roleFilter, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
      setFilteredEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to load employees');
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

  return (
    <Layout>
      <div className="employee-list-page">
        <div className="page-header">
          <div>
            <h1>Employees</h1>
            <p>Manage your organization's workforce</p>
            <br />
          </div>
          <div className="employee-count">
            <Users size={24} />
            <span>{employees.length} Employees</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, ID, department, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="IT">IT</option>
              <option value="Legal">Legal</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="HR">HR Officer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="filter-results">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>

        {/* Employee Cards */}
        <div className="employee-grid">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className="employee-card"
                onClick={() => navigate(`/employees/${emp._id}`)}
              >
                <div className="employee-avatar">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="employee-id">ID: {emp.employeeId}</p>
                  <div className="employee-meta">
                    <span className={`role-badge role-${emp.role?.toLowerCase()}`}>
                      {emp.role}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-full">
              <Users size={48} color="#9ca3af" />
              <p>No employees found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeList;
