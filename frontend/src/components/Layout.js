import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Calendar, FileText, DollarSign, 
  LogOut, Menu, X, User, Settings, List
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const isAdmin = employee?.role === 'Admin' || employee?.role === 'HR';
  const homePath = isAdmin ? '/admin/dashboard' : '/dashboard';

  const navigation = [
    { 
      name: 'Dashboard', 
      path: homePath, 
      icon: Home 
    },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Attendance Records', path: '/attendance-list', icon: List },
    { name: 'Leave', path: '/leave', icon: FileText },
    { name: 'Payroll', path: '/payroll', icon: DollarSign },
  ];

  if (isAdmin) {
    navigation.push({ name: 'Employees', path: '/employees', icon: Users });
  }

  // Check if current path starts with nav item path (for subpages)
  const isNavActive = (navPath) => {
    if (navPath === homePath) {
      return location.pathname === navPath;
    }
    return location.pathname.startsWith(navPath);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to={homePath} className="logo-link" onClick={() => setSidebarOpen(false)}>
            <h1 className="logo">
              <span className="logo-icon">⚡</span>
              DayFlow
            </h1>
          </Link>
          <button 
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {employee?.profilePicture ? (
                <img src={employee.profilePicture} alt="Profile" className="avatar-image" />
              ) : (
                <>{employee?.firstName?.[0]}{employee?.lastName?.[0]}</>
              )}
            </div>
            <div className="user-details">
              <p className="user-name">
                {employee?.firstName} {employee?.lastName}
              </p>
              <p className="user-role">{employee?.role}</p>
              {employee?.designation && (
                <p className="user-designation">
                  {employee.designation}
                </p>
              )}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button 
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="top-bar-right">
            <div className="user-badge">
              <div className="user-avatar-small">
                {employee?.profilePicture ? (
                  <img src={employee.profilePicture} alt="Profile" className="avatar-image-small" />
                ) : (
                  <>{employee?.firstName?.[0]}{employee?.lastName?.[0]}</>
                )}
              </div>
              <span className="user-name-small">
                {employee?.firstName} {employee?.lastName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
