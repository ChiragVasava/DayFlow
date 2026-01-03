import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import SignIn from './pages/SignIn';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import AttendanceList from './pages/AttendanceList';
import LeaveManagement from './pages/LeaveManagement';
import PayrollManagement from './pages/PayrollManagement';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import ChangePassword from './pages/ChangePassword';
import CreateEmployee from './pages/CreateEmployee';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/change-password" element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <EmployeeDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <PrivateRoute requiredRole={['Admin', 'HR']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/create-employee" element={
            <PrivateRoute requiredRole={['Admin', 'HR']}>
              <CreateEmployee />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/attendance" element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          } />
          
          <Route path="/attendance-list" element={
            <PrivateRoute>
              <AttendanceList />
            </PrivateRoute>
          } />
          
          <Route path="/leave" element={
            <PrivateRoute>
              <LeaveManagement />
            </PrivateRoute>
          } />
          
          <Route path="/payroll" element={
            <PrivateRoute>
              <PayrollManagement />
            </PrivateRoute>
          } />
          
          <Route path="/employees" element={
            <PrivateRoute requiredRole={['Admin', 'HR']}>
              <EmployeeList />
            </PrivateRoute>
          } />
          
          <Route path="/employees/:employeeId" element={
            <PrivateRoute requiredRole={['Admin', 'HR']}>
              <EmployeeDetail />
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
