import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Clock,
  TrendingUp,
  Users,
  Download,
  Filter
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths,
  startOfDay,
  addDays,
  subDays,
  differenceInMinutes,
  parseISO
} from 'date-fns';
import './AttendanceList.css';

const AttendanceList = () => {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const isAdminOrHR = employee.role === 'Admin' || employee.role === 'HR';

  // Admin/HR state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState('date'); // 'date' or 'day'
  const [searchTerm, setSearchTerm] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Employee state
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [myAttendance, setMyAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    daysPresent: 0,
    leavesCount: 0,
    totalWorkHours: 0,
    avgWorkHours: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdminOrHR) {
      fetchAllEmployees();
      fetchAttendanceByDate();
    } else {
      fetchMyAttendance();
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  // Admin/HR Functions
  const fetchAllEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setAllEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchAttendanceByDate = async () => {
    try {
      setLoading(true);
      const start = startOfDay(selectedDate);
      const end = startOfDay(addDays(selectedDate, 1));

      const response = await api.get('/attendance', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      setAttendanceRecords(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Employee Functions
  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(new Date(selectedYear, selectedMonth.getMonth()));
      const end = endOfMonth(new Date(selectedYear, selectedMonth.getMonth()));

      const response = await api.get('/attendance', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          employeeId: employee._id,
        },
      });

      const records = response.data.attendance || [];
      setMyAttendance(records);
      calculateStats(records, start, end);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records, startDate, endDate) => {
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const presentRecords = records.filter(r => r.status === 'Present');
    const daysPresent = presentRecords.length;
    const leavesCount = records.filter(r => r.status === 'Leave').length;

    let totalMinutes = 0;
    presentRecords.forEach(record => {
      if (record.checkIn && record.checkOut) {
        const checkIn = parseISO(record.checkIn);
        const checkOut = parseISO(record.checkOut);
        totalMinutes += differenceInMinutes(checkOut, checkIn);
      }
    });

    const totalWorkHours = (totalMinutes / 60).toFixed(2);
    const avgWorkHours = daysPresent > 0 ? (totalMinutes / 60 / daysPresent).toFixed(2) : 0;

    setStats({
      totalDays,
      daysPresent,
      leavesCount,
      totalWorkHours,
      avgWorkHours
    });
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '00:00';
    
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const minutes = differenceInMinutes(end, start);
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const calculateExtraHours = (checkIn, checkOut, standardHours = 8) => {
    if (!checkIn || !checkOut) return '00:00';
    
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const minutes = differenceInMinutes(end, start);
    const hours = minutes / 60;
    
    const extraHours = Math.max(0, hours - standardHours);
    const extraMinutes = Math.round((extraHours % 1) * 60);
    
    return `${String(Math.floor(extraHours)).padStart(2, '0')}:${String(extraMinutes).padStart(2, '0')}`;
  };

  const getEmployeeById = (empId) => {
    // Handle both populated employee objects and employee IDs
    if (typeof empId === 'object' && empId !== null) {
      return empId; // Already populated
    }
    return allEmployees.find(emp => emp._id === empId);
  };

  const filteredAttendance = attendanceRecords.filter(record => {
    const emp = getEmployeeById(record.employee);
    if (!emp) return false;
    
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const empId = emp.employeeId?.toLowerCase() || '';
    const department = emp.department?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           empId.includes(searchTerm.toLowerCase()) ||
           department.includes(searchTerm.toLowerCase());
  });

  const handlePreviousDate = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDate = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const handleMonthChange = (e) => {
    const monthIndex = parseInt(e.target.value);
    setSelectedMonth(new Date(selectedYear, monthIndex));
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setSelectedMonth(new Date(year, selectedMonth.getMonth()));
  };

  const exportToCSV = () => {
    if (isAdminOrHR) {
      // Export admin view
      const headers = ['Employee ID', 'Employee Name', 'Department', 'Check In', 'Check Out', 'Work Hours', 'Extra Hours', 'Status'];
      const rows = filteredAttendance.map(record => {
        const emp = getEmployeeById(record.employee);
        return [
          emp?.employeeId || 'N/A',
          `${emp?.firstName} ${emp?.lastName}`,
          emp?.department || 'N/A',
          record.checkIn ? format(parseISO(record.checkIn), 'HH:mm') : '-',
          record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '-',
          calculateWorkHours(record.checkIn, record.checkOut),
          calculateExtraHours(record.checkIn, record.checkOut),
          record.status
        ];
      });

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`;
      a.click();
    } else {
      // Export employee view
      const headers = ['Date', 'Check In', 'Check Out', 'Work Hours', 'Extra Hours', 'Status'];
      const rows = myAttendance.map(record => [
        format(parseISO(record.date), 'dd/MM/yyyy'),
        record.checkIn ? format(parseISO(record.checkIn), 'HH:mm') : '-',
        record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '-',
        calculateWorkHours(record.checkIn, record.checkOut),
        calculateExtraHours(record.checkIn, record.checkOut),
        record.status
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_attendance_${format(selectedMonth, 'yyyy-MM')}.csv`;
      a.click();
    }
    toast.success('Attendance data exported successfully!');
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

  // Admin/HR View
  if (isAdminOrHR) {
    return (
      <Layout>
        <div className="attendance-list-page">
          <div className="page-header">
            <div>
              <h1>Attendance Records</h1>
              <p>View and manage employee attendance</p>
            </div>
            <div className="header-actions">
              <button onClick={exportToCSV} className="export-btn">
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="filters-section">
            <div className="date-navigation">
              <button onClick={handlePreviousDate} className="nav-btn">
                <ChevronLeft size={20} />
              </button>
              <div className="date-display">
                <Calendar size={18} />
                <span>{format(selectedDate, 'dd, MMMM yyyy')}</span>
              </div>
              <button onClick={handleNextDate} className="nav-btn">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="attendance-stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{filteredAttendance.length}</h3>
                <p>Total Records</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{filteredAttendance.filter(r => r.status === 'Present').length}</h3>
                <p>Present Today</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{filteredAttendance.filter(r => r.status === 'Leave').length}</h3>
                <p>On Leave</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{filteredAttendance.filter(r => r.status === 'Absent').length}</h3>
                <p>Absent</p>
              </div>
            </div>
          </div>

          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Extra Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No attendance records found for this date
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => {
                    const emp = getEmployeeById(record.employee);
                    if (!emp) return null;

                    return (
                      <tr key={record._id}>
                        <td>{emp.employeeId}</td>
                        <td className="employee-name">
                          <div className="name-cell">
                            <div className="avatar">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <span>{emp.firstName} {emp.lastName}</span>
                          </div>
                        </td>
                        <td>{emp.department || 'N/A'}</td>
                        <td>{record.checkIn ? format(parseISO(record.checkIn), 'HH:mm') : '-'}</td>
                        <td>{record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '-'}</td>
                        <td>{calculateWorkHours(record.checkIn, record.checkOut)}</td>
                        <td className="extra-hours">{calculateExtraHours(record.checkIn, record.checkOut)}</td>
                        <td>
                          <span className={`status-badge ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }

  // Employee View
  return (
    <Layout>
      <div className="attendance-list-page employee-view">
        <div className="page-header">
          <div>
            <h1>My Attendance</h1>
            <p>Track your attendance and work hours</p>
          </div>
          <div className="header-actions">
            <button onClick={exportToCSV} className="export-btn">
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="month-navigation">
          <button onClick={handlePreviousMonth} className="nav-btn">
            <ChevronLeft size={20} />
          </button>
          <div className="month-year-selector">
            <select value={selectedMonth.getMonth()} onChange={handleMonthChange} className="month-select">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {format(new Date(2000, i), 'MMMM')}
                </option>
              ))}
            </select>
            <select value={selectedYear} onChange={handleYearChange} className="year-select">
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          <button onClick={handleNextMonth} className="nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="attendance-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalDays}</h3>
              <p>Total Days</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.daysPresent}</h3>
              <p>Days Present</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.leavesCount}</h3>
              <p>Leaves Taken</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalWorkHours}h</h3>
              <p>Total Work Hours</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.avgWorkHours}h</h3>
              <p>Avg Work Hours/Day</p>
            </div>
          </div>
        </div>

        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Extra Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No attendance records found for this month
                  </td>
                </tr>
              ) : (
                myAttendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => (
                    <tr key={record._id}>
                      <td className="date-cell">
                        {format(parseISO(record.date), 'dd/MM/yyyy')}
                        <span className="day-name">{format(parseISO(record.date), 'EEEE')}</span>
                      </td>
                      <td>{record.checkIn ? format(parseISO(record.checkIn), 'HH:mm') : '-'}</td>
                      <td>{record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '-'}</td>
                      <td className="work-hours">{calculateWorkHours(record.checkIn, record.checkOut)}</td>
                      <td className="extra-hours">{calculateExtraHours(record.checkIn, record.checkOut)}</td>
                      <td>
                        <span className={`status-badge ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceList;
