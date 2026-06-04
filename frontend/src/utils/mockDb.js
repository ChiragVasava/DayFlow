// Mock Database Utility for DayFlow HRM (Client-Side Guest Mode)

// Initial sample data
const DEFAULT_EMPLOYEES = [
  {
    _id: 'guest-admin-id',
    employeeId: 'ADM-GUEST',
    email: 'john.smith@example.com',
    role: 'Admin',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '+1987654321',
    address: { street: '123 Admin Way', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
    dateOfBirth: '1985-05-15',
    dateOfJoining: '2023-01-10',
    department: 'HR Operations',
    designation: 'HR Manager',
    salary: 95000,
    salaryInfo: {
      monthlyWage: 7900,
      yearlyWage: 95000,
      workingDaysPerWeek: 5,
      breakTimeHours: 1,
      components: {
        basicSalary: { value: 3950, percentage: 50 },
        houseRentAllowance: { value: 1975, percentage: 25 },
        standardAllowance: { value: 790, percentage: 10 },
        performanceBonus: { value: 500, percentage: 6.3 },
        leaveTravelAllowance: { value: 300, percentage: 3.8 },
        fixedAllowance: { value: 385, percentage: 4.9 }
      },
      providentFund: {
        employeeContribution: { value: 474, percentage: 12 },
        employerContribution: { value: 474, percentage: 12 }
      },
      taxDeductions: {
        professionalTax: 200,
        incomeTax: { value: 395, percentage: 5 }
      }
    },
    privateInfo: { gender: 'Male', maritalStatus: 'Married', nationality: 'American', personalEmail: 'john.personal@example.com' },
    bankDetails: { accountNumber: '9876543210', bankName: 'Chase Bank', ifscCode: 'CHAS0001234', panNumber: 'ABCDE1234F', uanNumber: '100200300400' },
    profilePicture: '',
    isActive: true,
    isFirstLogin: false,
    leaveBalance: { paid: 15, sick: 10, unpaid: 0 }
  },
  {
    _id: 'guest-employee-id',
    employeeId: 'EMP-GUEST',
    email: 'jane.doe@example.com',
    role: 'Employee',
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    address: { street: '456 Developer Ln', city: 'San Jose', state: 'CA', zipCode: '95112', country: 'USA' },
    dateOfBirth: '1992-08-20',
    dateOfJoining: '2024-01-15',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 80000,
    salaryInfo: {
      monthlyWage: 6600,
      yearlyWage: 80000,
      workingDaysPerWeek: 5,
      breakTimeHours: 1,
      components: {
        basicSalary: { value: 3300, percentage: 50 },
        houseRentAllowance: { value: 1650, percentage: 25 },
        standardAllowance: { value: 660, percentage: 10 },
        performanceBonus: { value: 400, percentage: 6 },
        leaveTravelAllowance: { value: 250, percentage: 3.8 },
        fixedAllowance: { value: 340, percentage: 5.2 }
      },
      providentFund: {
        employeeContribution: { value: 396, percentage: 12 },
        employerContribution: { value: 396, percentage: 12 }
      },
      taxDeductions: {
        professionalTax: 200,
        incomeTax: { value: 330, percentage: 5 }
      }
    },
    privateInfo: { gender: 'Female', maritalStatus: 'Single', nationality: 'American', personalEmail: 'jane.personal@example.com' },
    bankDetails: { accountNumber: '1234567890', bankName: 'Wells Fargo', ifscCode: 'WFBI0005678', panNumber: 'WXYZ9876A', uanNumber: '500600700800' },
    profilePicture: '',
    isActive: true,
    isFirstLogin: false,
    leaveBalance: { paid: 12, sick: 8, unpaid: 0 }
  },
  {
    _id: 'emp-alice-id',
    employeeId: 'EMP-ALICE',
    email: 'alice.johnson@example.com',
    role: 'HR',
    firstName: 'Alice',
    lastName: 'Johnson',
    phoneNumber: '+15550199',
    address: { street: '789 People Rd', city: 'Oakland', state: 'CA', zipCode: '94612', country: 'USA' },
    dateOfBirth: '1989-11-04',
    dateOfJoining: '2023-06-01',
    department: 'HR Operations',
    designation: 'HR Associate',
    salary: 70000,
    salaryInfo: {
      monthlyWage: 5800,
      yearlyWage: 70000,
      workingDaysPerWeek: 5,
      breakTimeHours: 1,
      components: {
        basicSalary: { value: 2900, percentage: 50 },
        houseRentAllowance: { value: 1450, percentage: 25 },
        standardAllowance: { value: 580, percentage: 10 },
        performanceBonus: { value: 300, percentage: 5.1 },
        leaveTravelAllowance: { value: 200, percentage: 3.4 },
        fixedAllowance: { value: 370, percentage: 6.5 }
      },
      providentFund: {
        employeeContribution: { value: 348, percentage: 12 },
        employerContribution: { value: 348, percentage: 12 }
      },
      taxDeductions: {
        professionalTax: 200,
        incomeTax: { value: 174, percentage: 3 }
      }
    },
    privateInfo: { gender: 'Female', maritalStatus: 'Married', nationality: 'American', personalEmail: 'alice.personal@example.com' },
    bankDetails: { accountNumber: '5554443321', bankName: 'Bank of America', ifscCode: 'BOFA0000999', panNumber: 'JKLM9876C', uanNumber: '700800900100' },
    profilePicture: '',
    isActive: true,
    isFirstLogin: false,
    leaveBalance: { paid: 18, sick: 9, unpaid: 0 }
  },
  {
    _id: 'emp-bob-id',
    employeeId: 'EMP-BOB',
    email: 'bob.miller@example.com',
    role: 'Employee',
    firstName: 'Bob',
    lastName: 'Miller',
    phoneNumber: '+15550244',
    address: { street: '101 Dev Plaza', city: 'Berkeley', state: 'CA', zipCode: '94704', country: 'USA' },
    dateOfBirth: '1995-04-12',
    dateOfJoining: '2024-03-01',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    salary: 75000,
    salaryInfo: {
      monthlyWage: 6250,
      yearlyWage: 75000,
      workingDaysPerWeek: 5,
      breakTimeHours: 1,
      components: {
        basicSalary: { value: 3125, percentage: 50 },
        houseRentAllowance: { value: 1562, percentage: 25 },
        standardAllowance: { value: 625, percentage: 10 },
        performanceBonus: { value: 350, percentage: 5.6 },
        leaveTravelAllowance: { value: 200, percentage: 3.2 },
        fixedAllowance: { value: 388, percentage: 6.2 }
      },
      providentFund: {
        employeeContribution: { value: 375, percentage: 12 },
        employerContribution: { value: 375, percentage: 12 }
      },
      taxDeductions: {
        professionalTax: 200,
        incomeTax: { value: 187, percentage: 3 }
      }
    },
    privateInfo: { gender: 'Male', maritalStatus: 'Single', nationality: 'American', personalEmail: 'bob.personal@example.com' },
    bankDetails: { accountNumber: '8887776665', bankName: 'Citibank', ifscCode: 'CITI0000777', panNumber: 'PQRS1234D', uanNumber: '900100200300' },
    profilePicture: '',
    isActive: true,
    isFirstLogin: false,
    leaveBalance: { paid: 20, sick: 10, unpaid: 0 }
  }
];

// Prepopulated leaves
const DEFAULT_LEAVES = [
  {
    _id: 'leave-1-id',
    employee: { _id: 'guest-employee-id', firstName: 'Jane', lastName: 'Doe', designation: 'Software Engineer', department: 'Engineering' },
    leaveType: 'Paid',
    startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
    numberOfDays: 4,
    reason: 'Family trip to Yosemite',
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'leave-2-id',
    employee: { _id: 'emp-bob-id', firstName: 'Bob', lastName: 'Miller', designation: 'Frontend Engineer', department: 'Engineering' },
    leaveType: 'Sick',
    startDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    numberOfDays: 2,
    reason: 'Flu symptoms',
    status: 'Approved',
    reviewedBy: 'guest-admin-id',
    reviewedAt: new Date(new Date().setDate(new Date().getDate() - 16)).toISOString(),
    reviewComments: 'Get well soon!',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 17)).toISOString()
  },
  {
    _id: 'leave-3-id',
    employee: { _id: 'guest-employee-id', firstName: 'Jane', lastName: 'Doe', designation: 'Software Engineer', department: 'Engineering' },
    leaveType: 'Sick',
    startDate: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    numberOfDays: 1,
    reason: 'Dentist appointment',
    status: 'Approved',
    reviewedBy: 'guest-admin-id',
    reviewedAt: new Date(new Date().setDate(new Date().getDate() - 26)).toISOString(),
    reviewComments: 'Approved',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 27)).toISOString()
  }
];

// Prepopulated payrolls
const DEFAULT_PAYROLLS = [
  {
    _id: 'payroll-1-id',
    employee: { _id: 'guest-employee-id', firstName: 'Jane', lastName: 'Doe', employeeId: 'EMP-GUEST', department: 'Engineering' },
    month: new Date().getMonth() === 0 ? 12 : new Date().getMonth(), // Last month
    year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    basicSalary: 3300,
    allowances: { hra: 1650, transport: 660, medical: 250, other: 340 },
    deductions: { tax: 330, providentFund: 396, insurance: 100, other: 0 },
    bonuses: 150,
    lopDays: 0,
    lopDeduction: 0,
    grossSalary: 6350, // 3300 + 1650 + 660 + 250 + 340 + 150
    netSalary: 5524, // 6350 - (330 + 396 + 100)
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: 'payroll-2-id',
    employee: { _id: 'emp-bob-id', firstName: 'Bob', lastName: 'Miller', employeeId: 'EMP-BOB', department: 'Engineering' },
    month: new Date().getMonth() === 0 ? 12 : new Date().getMonth(),
    year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    basicSalary: 3125,
    allowances: { hra: 1562, transport: 625, medical: 200, other: 388 },
    deductions: { tax: 187, providentFund: 375, insurance: 100, other: 0 },
    bonuses: 0,
    lopDays: 0,
    lopDeduction: 0,
    grossSalary: 5900,
    netSalary: 5238,
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

// Helper: Get database from localStorage
const getDb = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

// Helper: Set database in localStorage
const setDb = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const initMockDatabase = () => {
  getDb('df_employees', DEFAULT_EMPLOYEES);
  getDb('df_leaves', DEFAULT_LEAVES);
  getDb('df_payrolls', DEFAULT_PAYROLLS);
  
  // Dynamically generate attendance records for current month up to yesterday
  if (!localStorage.getItem('df_attendance')) {
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    const attendance = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    
    // Create attendance logs starting from 1st of the current month
    for (let day = 1; day < today.getDate(); day++) {
      const logDate = new Date(currentYear, currentMonth, day);
      const isWeekend = logDate.getDay() === 0 || logDate.getDay() === 6;
      
      if (!isWeekend) {
        employees.forEach(emp => {
          // 92% attendance rate simulation
          const isPresent = Math.random() > 0.08;
          if (isPresent) {
            // Random check-in between 8:45 AM and 9:30 AM
            const checkInHour = 8;
            const checkInMin = Math.floor(Math.random() * 45) + 45; // 45 to 90 mins after 8:00
            const checkInTime = new Date(logDate);
            checkInTime.setHours(checkInHour, checkInMin, 0);
            
            // Random check-out between 5:00 PM and 6:30 PM
            const checkOutHour = 17 + Math.floor(Math.random() * 2);
            const checkOutMin = Math.floor(Math.random() * 60);
            const checkOutTime = new Date(logDate);
            checkOutTime.setHours(checkOutHour, checkOutMin, 0);
            
            const workHrs = Math.round(((checkOutTime - checkInTime) / (1000 * 60 * 60)) * 100) / 100;
            const status = workHrs >= 8 ? 'Present' : 'Half-day';
            
            attendance.push({
              _id: `att-${emp._id}-${day}`,
              employee: emp._id,
              date: logDate.toISOString(),
              status: status,
              checkIn: checkInTime.toISOString(),
              checkOut: checkOutTime.toISOString(),
              workHours: workHrs,
              remarks: checkInMin > 90 ? 'Late check-in' : 'On time'
            });
          } else {
            attendance.push({
              _id: `att-${emp._id}-${day}`,
              employee: emp._id,
              date: logDate.toISOString(),
              status: 'Absent',
              workHours: 0,
              remarks: 'Unexcused absence'
            });
          }
        });
      }
    }
    setDb('df_attendance', attendance);
  }
};

// Initialize
initMockDatabase();

// --- DB Methods ---

export const mockDb = {
  // Authentication
  getMe: () => {
    const saved = localStorage.getItem('employee');
    return saved ? JSON.parse(saved) : null;
  },

  // Employees
  getEmployees: () => {
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    return { employees, count: employees.length };
  },

  getEmployeeById: (id) => {
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    const employee = employees.find(e => e._id === id || e.employeeId === id);
    return { employee };
  },

  createEmployee: (employeeData) => {
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    const newId = 'emp-' + Math.random().toString(36).substr(2, 9);
    
    // Setup basic salary structure if missing
    const monthlyWage = Math.round(employeeData.salary / 12) || 4000;
    const newEmployee = {
      ...employeeData,
      _id: newId,
      employeeId: employeeData.employeeId || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      salary: Number(employeeData.salary) || 50000,
      salaryInfo: {
        monthlyWage,
        yearlyWage: Number(employeeData.salary) || 50000,
        workingDaysPerWeek: 5,
        breakTimeHours: 1,
        components: {
          basicSalary: { value: Math.round(monthlyWage * 0.5), percentage: 50 },
          houseRentAllowance: { value: Math.round(monthlyWage * 0.25), percentage: 25 },
          standardAllowance: { value: Math.round(monthlyWage * 0.1), percentage: 10 },
          performanceBonus: { value: Math.round(monthlyWage * 0.05), percentage: 5 },
          leaveTravelAllowance: { value: Math.round(monthlyWage * 0.05), percentage: 5 },
          fixedAllowance: { value: Math.round(monthlyWage * 0.05), percentage: 5 }
        },
        providentFund: {
          employeeContribution: { value: Math.round(monthlyWage * 0.12), percentage: 12 },
          employerContribution: { value: Math.round(monthlyWage * 0.12), percentage: 12 }
        },
        taxDeductions: {
          professionalTax: 200,
          incomeTax: { value: Math.round(monthlyWage * 0.05), percentage: 5 }
        }
      },
      leaveBalance: { paid: 20, sick: 10, unpaid: 0 },
      isActive: true,
      isFirstLogin: false,
      createdAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    setDb('df_employees', employees);
    return { success: true, employee: newEmployee };
  },

  updateEmployee: (id, employeeData) => {
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    const idx = employees.findIndex(e => e._id === id || e.employeeId === id);
    if (idx !== -1) {
      employees[idx] = { ...employees[idx], ...employeeData };
      setDb('df_employees', employees);
      
      // Update local storage if it is the logged-in employee
      const me = mockDb.getMe();
      if (me && (me._id === id || me.employeeId === id)) {
        localStorage.setItem('employee', JSON.stringify(employees[idx]));
      }
      return { success: true, employee: employees[idx] };
    }
    return { success: false, message: 'Employee not found' };
  },

  // Attendance
  getAttendance: (startDate, endDate) => {
    const attendance = getDb('df_attendance', []);
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    
    let filtered = attendance;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = attendance.filter(a => {
        const d = new Date(a.date);
        return d >= start && d <= end;
      });
    }

    // Populate employee details for response
    const populated = filtered.map(a => {
      const emp = employees.find(e => e._id === a.employee);
      return {
        ...a,
        employee: emp ? { _id: emp._id, firstName: emp.firstName, lastName: emp.lastName, employeeId: emp.employeeId, department: emp.department, designation: emp.designation } : null
      };
    });

    return { attendance: populated };
  },

  checkIn: () => {
    const me = mockDb.getMe();
    if (!me) return { success: false, message: 'Not authenticated' };

    const attendance = getDb('df_attendance', []);
    const today = new Date();
    today.setHours(0,0,0,0);

    // Check if check-in already exists
    const existing = attendance.find(
      a => a.employee === me._id && new Date(a.date).toDateString() === today.toDateString()
    );

    if (existing) {
      return { success: false, message: 'Already checked in today' };
    }

    const checkInTime = new Date();
    const newAtt = {
      _id: `att-${me._id}-${Date.now()}`,
      employee: me._id,
      date: new Date().toISOString(),
      status: 'Present',
      checkIn: checkInTime.toISOString(),
      workHours: 0,
      remarks: checkInTime.getHours() >= 9 && checkInTime.getMinutes() > 30 ? 'Late check-in' : 'On time'
    };

    attendance.push(newAtt);
    setDb('df_attendance', attendance);
    return { success: true, attendance: newAtt };
  },

  checkOut: () => {
    const me = mockDb.getMe();
    if (!me) return { success: false, message: 'Not authenticated' };

    const attendance = getDb('df_attendance', []);
    const today = new Date();
    
    // Find today's check-in
    const idx = attendance.findIndex(
      a => a.employee === me._id && new Date(a.date).toDateString() === today.toDateString()
    );

    if (idx === -1) {
      return { success: false, message: 'No check-in record found for today' };
    }

    if (attendance[idx].checkOut) {
      return { success: false, message: 'Already checked out today' };
    }

    const checkInTime = new Date(attendance[idx].checkIn);
    const checkOutTime = new Date();
    const hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    const workHrs = Math.round(hours * 100) / 100;
    
    attendance[idx].checkOut = checkOutTime.toISOString();
    attendance[idx].workHours = workHrs;
    attendance[idx].status = workHrs >= 8 ? 'Present' : 'Half-day';

    setDb('df_attendance', attendance);
    return { success: true, attendance: attendance[idx] };
  },

  // Leaves
  getLeaves: () => {
    const leaves = getDb('df_leaves', DEFAULT_LEAVES);
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);

    const populated = leaves.map(l => {
      // If employee field is just ID, populate it
      const empId = typeof l.employee === 'object' ? l.employee._id : l.employee;
      const emp = employees.find(e => e._id === empId);
      return {
        ...l,
        employee: emp ? { _id: emp._id, firstName: emp.firstName, lastName: emp.lastName, employeeId: emp.employeeId, department: emp.department, designation: emp.designation } : l.employee
      };
    });

    return { leaves: populated.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) };
  },

  createLeave: (leaveData) => {
    const me = mockDb.getMe();
    if (!me) return { success: false, message: 'Not authenticated' };

    const leaves = getDb('df_leaves', DEFAULT_LEAVES);
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    const empIdx = employees.findIndex(e => e._id === me._id);

    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check balance
    if (empIdx !== -1) {
      const balanceType = leaveData.leaveType.toLowerCase(); // 'paid', 'sick', 'unpaid'
      const balance = employees[empIdx].leaveBalance[balanceType] || 0;
      if (balanceType !== 'unpaid' && balance < days) {
        return { success: false, message: `Insufficient leave balance. Remaining: ${balance} days` };
      }
    }

    const newLeave = {
      _id: `leave-${Date.now()}`,
      employee: { _id: me._id, firstName: me.firstName, lastName: me.lastName, designation: me.designation, department: me.department },
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      numberOfDays: days,
      reason: leaveData.reason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    leaves.push(newLeave);
    setDb('df_leaves', leaves);
    return { success: true, leave: newLeave };
  },

  reviewLeave: (leaveId, reviewData) => {
    const me = mockDb.getMe();
    const leaves = getDb('df_leaves', DEFAULT_LEAVES);
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);

    const idx = leaves.findIndex(l => l._id === leaveId);
    if (idx === -1) return { success: false, message: 'Leave request not found' };

    const leave = leaves[idx];
    leave.status = reviewData.status; // 'Approved' or 'Rejected'
    leave.reviewedBy = me ? me._id : 'guest-admin-id';
    leave.reviewedAt = new Date().toISOString();
    leave.reviewComments = reviewData.reviewComments;

    // Deduct leave balance if approved
    if (reviewData.status === 'Approved') {
      const empId = typeof leave.employee === 'object' ? leave.employee._id : leave.employee;
      const empIdx = employees.findIndex(e => e._id === empId);
      
      if (empIdx !== -1) {
        const type = leave.leaveType.toLowerCase(); // 'paid', 'sick', 'unpaid'
        if (type !== 'unpaid') {
          const currentBal = employees[empIdx].leaveBalance[type] || 0;
          employees[empIdx].leaveBalance[type] = Math.max(0, currentBal - leave.numberOfDays);
          setDb('df_employees', employees);
          
          // Update me in local storage if the reviewer is updating their own leave
          const meObj = mockDb.getMe();
          if (meObj && meObj._id === empId) {
            meObj.leaveBalance[type] = employees[empIdx].leaveBalance[type];
            localStorage.setItem('employee', JSON.stringify(meObj));
          }
        }
      }
    }

    setDb('df_leaves', leaves);
    return { success: true, leave };
  },

  deleteLeave: (leaveId) => {
    const leaves = getDb('df_leaves', DEFAULT_LEAVES);
    const filtered = leaves.filter(l => l._id !== leaveId);
    setDb('df_leaves', filtered);
    return { success: true };
  },

  // Payroll
  getPayrolls: () => {
    const payrolls = getDb('df_payrolls', DEFAULT_PAYROLLS);
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);

    const populated = payrolls.map(p => {
      const empId = typeof p.employee === 'object' ? p.employee._id : p.employee;
      const emp = employees.find(e => e._id === empId);
      return {
        ...p,
        employee: emp ? { _id: emp._id, firstName: emp.firstName, lastName: emp.lastName, employeeId: emp.employeeId, department: emp.department, designation: emp.designation } : p.employee
      };
    });

    return { payrolls: populated.sort((a,b) => b.year - a.year || b.month - a.month) };
  },

  getAttendanceSummary: (employeeId, month, year) => {
    const attendance = getDb('df_attendance', []);
    
    // Filter by employee, month and year
    const empAtt = attendance.filter(a => {
      const d = new Date(a.date);
      return a.employee === employeeId && 
             (d.getMonth() + 1) === Number(month) && 
             d.getFullYear() === Number(year);
    });

    const presentDays = empAtt.filter(a => a.status === 'Present').length;
    const halfDays = empAtt.filter(a => a.status === 'Half-day').length;
    const absentDays = empAtt.filter(a => a.status === 'Absent').length;
    const lateArrivals = empAtt.filter(a => a.remarks?.includes('Late')).length;
    const overtimeHours = empAtt.reduce((sum, a) => sum + Math.max(0, (a.workHours || 0) - 8), 0);

    // Compute leaves in this period
    const leaves = getDb('df_leaves', DEFAULT_LEAVES);
    const empLeaves = leaves.filter(l => {
      const empId = typeof l.employee === 'object' ? l.employee._id : l.employee;
      if (empId !== employeeId || l.status !== 'Approved') return false;
      const start = new Date(l.startDate);
      return (start.getMonth() + 1) === Number(month) && start.getFullYear() === Number(year);
    });

    const paidLeaves = empLeaves.filter(l => l.leaveType === 'Paid').reduce((sum, l) => sum + l.numberOfDays, 0);
    const sickLeaves = empLeaves.filter(l => l.leaveType === 'Sick').reduce((sum, l) => sum + l.numberOfDays, 0);
    const unpaidLeaves = empLeaves.filter(l => l.leaveType === 'Unpaid').reduce((sum, l) => sum + l.numberOfDays, 0);

    return {
      summary: {
        totalWorkingDays: 22,
        presentDays,
        halfDays,
        paidLeaves,
        sickLeaves,
        unpaidLeaves,
        absentDays,
        lateArrivals,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        lopDays: unpaidLeaves + absentDays
      }
    };
  },

  generatePayslip: (employeeId, month, year) => {
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);
    const employee = employees.find(e => e._id === employeeId || e.employeeId === employeeId);
    if (!employee) throw new Error('Employee not found');

    const summaryRes = mockDb.getAttendanceSummary(employee._id, month, year);
    const summary = summaryRes.summary;

    const monthlyWage = employee.salaryInfo?.monthlyWage || Math.round(employee.salary / 12) || 4000;
    const basic = employee.salaryInfo?.components?.basicSalary?.value || Math.round(monthlyWage * 0.5);
    const hra = employee.salaryInfo?.components?.houseRentAllowance?.value || Math.round(monthlyWage * 0.25);
    const transport = employee.salaryInfo?.components?.standardAllowance?.value || Math.round(monthlyWage * 0.1);
    const medical = employee.salaryInfo?.components?.performanceBonus?.value || Math.round(monthlyWage * 0.05);

    // Overtime pay (e.g. $25 per hour)
    const overtimePay = Math.round(summary.overtimeHours * 25);
    const bonuses = 0;

    // LOP Deduction = (Basic Salary / 22) * LOP Days
    const lopDeduction = Math.round((monthlyWage / 22) * summary.lopDays);
    const tax = employee.salaryInfo?.taxDeductions?.incomeTax?.value || Math.round(monthlyWage * 0.05);
    const pf = employee.salaryInfo?.providentFund?.employeeContribution?.value || Math.round(monthlyWage * 0.12);
    const insurance = 100;
    // Late arrival penalty: $5 per late arrival
    const latePenalty = summary.lateArrivals * 5;

    const grossSalary = basic + hra + transport + medical + bonuses + overtimePay;
    const netSalary = grossSalary - (tax + pf + insurance + lopDeduction + latePenalty);

    const payrolls = getDb('df_payrolls', DEFAULT_PAYROLLS);

    // Remove existing if duplicate
    const filteredPayrolls = payrolls.filter(p => {
      const pEmpId = typeof p.employee === 'object' ? p.employee._id : p.employee;
      return !(pEmpId === employee._id && p.month === Number(month) && p.year === Number(year));
    });

    const newPayroll = {
      _id: `payroll-${Date.now()}`,
      employee: { _id: employee._id, firstName: employee.firstName, lastName: employee.lastName, employeeId: employee.employeeId, department: employee.department },
      month: Number(month),
      year: Number(year),
      basicSalary: basic,
      allowances: { hra, transport, medical, other: 0 },
      deductions: { tax, providentFund: pf, insurance, other: latePenalty },
      bonuses,
      overtimePay,
      lopDays: summary.lopDays,
      lopDeduction,
      grossSalary,
      netSalary: Math.max(0, netSalary),
      paymentStatus: 'Pending',
      attendanceSummary: summary,
      createdAt: new Date().toISOString()
    };

    filteredPayrolls.push(newPayroll);
    setDb('df_payrolls', filteredPayrolls);

    return { payroll: newPayroll, attendanceDetails: summary };
  },

  createPayroll: (payrollData) => {
    const payrolls = getDb('df_payrolls', DEFAULT_PAYROLLS);
    const employees = getDb('df_employees', DEFAULT_EMPLOYEES);

    const emp = employees.find(e => e._id === payrollData.employee);
    const basic = Number(payrollData.basicSalary) || 0;
    const hra = Number(payrollData.allowances?.hra) || 0;
    const transport = Number(payrollData.allowances?.transport) || 0;
    const medical = Number(payrollData.allowances?.medical) || 0;

    const tax = Number(payrollData.deductions?.tax) || 0;
    const pf = Number(payrollData.deductions?.providentFund) || 0;
    const insurance = Number(payrollData.deductions?.insurance) || 0;
    const otherDeduct = Number(payrollData.deductions?.other) || 0;
    const bonuses = Number(payrollData.bonuses) || 0;

    const grossSalary = basic + hra + transport + medical + bonuses;
    const netSalary = grossSalary - (tax + pf + insurance + otherDeduct);

    const newPayroll = {
      ...payrollData,
      _id: `payroll-${Date.now()}`,
      employee: emp ? { _id: emp._id, firstName: emp.firstName, lastName: emp.lastName, employeeId: emp.employeeId, department: emp.department } : payrollData.employee,
      basicSalary: basic,
      allowances: { hra, transport, medical, other: 0 },
      deductions: { tax, providentFund: pf, insurance, other: otherDeduct },
      bonuses,
      grossSalary,
      netSalary: Math.max(0, netSalary),
      createdAt: new Date().toISOString()
    };

    payrolls.push(newPayroll);
    setDb('df_payrolls', payrolls);
    return newPayroll;
  },

  updatePayroll: (id, payrollData) => {
    const payrolls = getDb('df_payrolls', DEFAULT_PAYROLLS);
    const idx = payrolls.findIndex(p => p._id === id);
    if (idx !== -1) {
      const basic = Number(payrollData.basicSalary) || 0;
      const hra = Number(payrollData.allowances?.hra) || 0;
      const transport = Number(payrollData.allowances?.transport) || 0;
      const medical = Number(payrollData.allowances?.medical) || 0;
      
      const tax = Number(payrollData.deductions?.tax) || 0;
      const pf = Number(payrollData.deductions?.providentFund) || 0;
      const insurance = Number(payrollData.deductions?.insurance) || 0;
      const otherDeduct = Number(payrollData.deductions?.other) || 0;
      const bonuses = Number(payrollData.bonuses) || 0;

      const grossSalary = basic + hra + transport + medical + bonuses;
      const netSalary = grossSalary - (tax + pf + insurance + otherDeduct);

      payrolls[idx] = {
        ...payrolls[idx],
        ...payrollData,
        basicSalary: basic,
        allowances: { hra, transport, medical, other: 0 },
        deductions: { tax, providentFund: pf, insurance, other: otherDeduct },
        bonuses,
        grossSalary,
        netSalary: Math.max(0, netSalary)
      };

      setDb('df_payrolls', payrolls);
      return payrolls[idx];
    }
    throw new Error('Payroll not found');
  },

  deletePayroll: (id) => {
    const payrolls = getDb('df_payrolls', DEFAULT_PAYROLLS);
    const filtered = payrolls.filter(p => p._id !== id);
    setDb('df_payrolls', filtered);
    return { success: true };
  }
};
