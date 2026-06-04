import axios from 'axios';
import { mockDb } from './mockDb';

// Custom adapter to intercept requests in Guest Mode
const guestAdapter = async (config) => {
  const { url, method, data, params } = config;
  
  // Parse body data if it's a JSON string
  let body = {};
  if (data) {
    try {
      body = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      body = data;
    }
  }

  // Helper to construct success response
  const successRes = (data, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config
  });

  // Helper to construct error response
  const errorRes = (message, status = 400) => {
    const err = new Error(message);
    err.response = {
      data: { message },
      status,
      statusText: 'Bad Request',
      headers: {},
      config
    };
    throw err;
  };

  // Extract path and clean it
  // Match both relative paths like "/api/employees" and full paths like "http://localhost:5000/api/employees"
  const cleanUrl = url
    .replace(/^https?:\/\/[^/]+/, '') // Remove protocol and host
    .replace(/^\/api/, '')            // Remove api prefix
    .split('?')[0];                   // Remove query parameters

  // Routing
  try {
    // 1. Auth routes
    if (cleanUrl === '/auth/me' && method === 'get') {
      const me = mockDb.getMe();
      if (!me) return errorRes('Not authenticated', 401);
      return successRes({ employee: me });
    }
    
    if (cleanUrl === '/auth/signin' && method === 'post') {
      const employees = mockDb.getEmployees().employees;
      const found = employees.find(e => e.employeeId === body.employeeId);
      if (found) {
        return successRes({
          token: 'guest-token-' + found.role.toLowerCase(),
          employee: found,
          isFirstLogin: false
        });
      }
      return errorRes('Invalid Employee ID', 401);
    }

    if (cleanUrl === '/auth/create-employee' && method === 'post') {
      const res = mockDb.createEmployee(body);
      return successRes(res);
    }

    if (cleanUrl === '/auth/change-password' && method === 'put') {
      return successRes({ success: true, message: 'Password changed successfully' });
    }

    // 2. Employees routes
    if (cleanUrl === '/employees' && method === 'get') {
      return successRes(mockDb.getEmployees());
    }

    if (cleanUrl.startsWith('/employees/')) {
      const parts = cleanUrl.split('/');
      const id = parts[2];
      
      if (cleanUrl.endsWith('/photo') && method === 'post') {
         return successRes({ success: true, photoUrl: '' });
      }
      if (method === 'get') {
        return successRes(mockDb.getEmployeeById(id));
      }
      if (method === 'put') {
        const res = mockDb.updateEmployee(id, body);
        if (res.success) return successRes(res);
        return errorRes(res.message, 404);
      }
    }

    // 3. Attendance routes
    if (cleanUrl === '/attendance') {
      if (method === 'get') {
        const { startDate, endDate } = params || {};
        return successRes(mockDb.getAttendance(startDate, endDate));
      }
    }

    if (cleanUrl === '/attendance/checkin' && method === 'post') {
      const res = mockDb.checkIn();
      if (res.success) return successRes(res);
      return errorRes(res.message, 400);
    }

    if (cleanUrl === '/attendance/checkout' && method === 'post') {
      const res = mockDb.checkOut();
      if (res.success) return successRes(res);
      return errorRes(res.message, 400);
    }

    // 4. Leave routes
    if (cleanUrl === '/leave') {
      if (method === 'get') {
        return successRes(mockDb.getLeaves());
      }
      if (method === 'post') {
        const res = mockDb.createLeave(body);
        if (res.success) return successRes(res);
        return errorRes(res.message, 400);
      }
    }

    if (cleanUrl.startsWith('/leave/')) {
      const parts = cleanUrl.split('/');
      const id = parts[2];
      
      if (cleanUrl.endsWith('/review') && method === 'put') {
        const res = mockDb.reviewLeave(id, body);
        if (res.success) return successRes(res);
        return errorRes(res.message, 400);
      }
      if (method === 'delete') {
        return successRes(mockDb.deleteLeave(id));
      }
    }

    // 5. Payroll routes
    if (cleanUrl === '/payroll') {
      if (method === 'get') {
        return successRes(mockDb.getPayrolls());
      }
      if (method === 'post') {
        return successRes({ payroll: mockDb.createPayroll(body) });
      }
    }

    if (cleanUrl.startsWith('/payroll/attendance-summary/') && method === 'get') {
      const parts = cleanUrl.split('/');
      // /payroll/attendance-summary/:employeeId/:month/:year
      const employeeId = parts[3];
      const month = parts[4];
      const year = parts[5];
      return successRes(mockDb.getAttendanceSummary(employeeId, month, year));
    }

    if (cleanUrl === '/payroll/generate-payslip' && method === 'post') {
      const { employeeId, month, year } = body;
      return successRes(mockDb.generatePayslip(employeeId, month, year));
    }

    if (cleanUrl.startsWith('/payroll/')) {
      const parts = cleanUrl.split('/');
      const id = parts[2];
      
      if (method === 'put') {
        return successRes({ payroll: mockDb.updatePayroll(id, body) });
      }
      if (method === 'delete') {
        return successRes(mockDb.deletePayroll(id));
      }
    }

    return errorRes(`Mock route not found: ${cleanUrl} (${method})`, 404);
  } catch (err) {
    if (err.response) throw err;
    return errorRes(err.message || 'Internal Server Error', 500);
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests & switch adapter if in guest mode
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (localStorage.getItem('is_guest') === 'true') {
      config.adapter = guestAdapter;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('employee');
      localStorage.removeItem('is_guest');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
