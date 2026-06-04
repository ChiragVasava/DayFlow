import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import './Attendance.css';

const Attendance = () => {
  const { employee } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await api.get('/attendance', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          employeeId: employee._id,
        },
      });

      setAttendance(response.data.attendance);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getAttendanceForDate = (date) => {
    return attendance.find((a) => isSameDay(new Date(a.date), date));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
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
        return <Calendar size={20} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Present':
        return 'status-present';
      case 'Absent':
        return 'status-absent';
      case 'Half-day':
        return 'status-halfday';
      case 'Leave':
        return 'status-leave';
      default:
        return '';
    }
  };

  const calculateStats = () => {
    const present = attendance.filter((a) => a.status === 'Present').length;
    const absent = attendance.filter((a) => a.status === 'Absent').length;
    const halfDay = attendance.filter((a) => a.status === 'Half-day').length;
    const leave = attendance.filter((a) => a.status === 'Leave').length;
    const totalWorkingDays = getDaysInMonth().filter(
      (date) => date.getDay() !== 0 && date.getDay() !== 6
    ).length;

    return { present, absent, halfDay, leave, totalWorkingDays };
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

  const stats = calculateStats();
  const days = getDaysInMonth();

  return (
    <Layout>
      <div className="attendance-page">
        <div className="page-header">
          <h1>Attendance</h1>
          <p>Track your daily attendance and work hours</p>
        </div>

        {/* Stats */}
        <div className="attendance-stats">
          <div className="stat-item status-present">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="stat-label">Present</p>
              <p className="stat-number">{stats.present} days</p>
            </div>
          </div>
          <div className="stat-item status-absent">
            <div className="stat-icon">
              <XCircle size={24} />
            </div>
            <div>
              <p className="stat-label">Absent</p>
              <p className="stat-number">{stats.absent} days</p>
            </div>
          </div>
          <div className="stat-item status-halfday">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div>
              <p className="stat-label">Half Day</p>
              <p className="stat-number">{stats.halfDay} days</p>
            </div>
          </div>
          <div className="stat-item status-leave">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div>
              <p className="stat-label">On Leave</p>
              <p className="stat-number">{stats.leave} days</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-card">
          <div className="calendar-header">
            <button className="month-nav-btn" onClick={handlePreviousMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="current-month">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button 
              className="month-nav-btn" 
              onClick={handleNextMonth}
              disabled={format(currentMonth, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {/* Empty cells for offset */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}

            {/* Day cells */}
            {days.map((date) => {
              const attendanceData = getAttendanceForDate(date);
              const isToday = isSameDay(date, new Date());
              const isFuture = date > new Date();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={date.toISOString()}
                  className={`calendar-day ${isToday ? 'today' : ''} ${
                    attendanceData ? getStatusClass(attendanceData.status) : ''
                  } ${isWeekend ? 'weekend' : ''} ${isFuture ? 'future' : ''}`}
                >
                  <div className="day-number">{format(date, 'd')}</div>
                  {attendanceData && (
                    <div className="day-status">
                      {getStatusIcon(attendanceData.status)}
                      <span className="status-text">{attendanceData.status}</span>
                      {attendanceData.workHours > 0 && (
                        <span className="work-hours">
                          {attendanceData.workHours.toFixed(1)}h
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card">
          <h2 className="card-title">Attendance Records</h2>
          
          {attendance.length > 0 ? (
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
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                      <td>
                        <span className={`badge badge-${
                          record.status === 'Present' ? 'success' : 
                          record.status === 'Absent' ? 'danger' : 
                          record.status === 'Half-day' ? 'warning' : 'info'
                        }`}>
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
            </div>
          ) : (
            <p className="empty-state">No attendance records for this month.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
