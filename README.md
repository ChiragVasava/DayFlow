# DayFlow - Human Resource Management System 🚀👱

**Every workday, perfectly aligned.**

A modern, full-stack Human Resource Management System (HRMS) built with the MERN stack (MongoDB, Express, React, Node.js). DayFlow streamlines core HR operations including employee management, attendance tracking, leave management, and payroll visibility with a beautiful, professional UI.

![DayFlow](https://img.shields.io/badge/DayFlow-HRMS-blueviolet) 
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green)
![Express](https://img.shields.io/badge/Express-4.18+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![Node](https://img.shields.io/badge/Node-18+-green)

## ✨ Features

### 🔐 Authentication & Authorization
- **Auto-generated Employee ID system** (Format: OIJODO20220001)
- System-generated passwords for new employees
- Secure JWT-based authentication
- Role-based access control (Admin, HR, Employee)
- Password encryption with bcrypt
- Forced password change on first login
- Admin/HR-only employee creation (no public registration)
- Email verification support

*See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for detailed information*

### 👥 Employee Management
- Complete employee profile management
- Personal and job details tracking
- Document management
- Employee directory with search
- Role-based profile editing

### 📅 Attendance Tracking
- Daily check-in/check-out functionality
- Visual calendar view of attendance
- Monthly attendance reports
- Work hours calculation
- Attendance status (Present, Absent, Half-day, Leave)

### 🏖️ Leave Management
- Apply for different leave types (Paid, Sick, Unpaid)
- Leave balance tracking
- Leave request approval workflow
- Leave history and status tracking
- Automatic leave balance deduction

### 💰 Payroll Management
- Salary structure with allowances and deductions
- Gross and net salary calculation
- Detailed salary breakdown
- Payroll history
- Payment status tracking

### 🎨 Modern UI/UX
- Beautiful gradient design
- Responsive layout for all devices
- Smooth animations and transitions
- Intuitive navigation
- Professional dashboard views
- Real-time notifications

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **lucide-react** - Icon library
- **react-hot-toast** - Notifications
- **Context API** - State management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DayFlow
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update the values
cp .env.example .env

# Start MongoDB (if not running)
# On Windows: Start MongoDB service from Services
# On Mac/Linux: sudo systemctl start mongod

# Create the first admin account
node createAdmin.js
# This will create an admin account with Employee ID: OIADMN20230001
# Default password: admin123 (change after first login!)

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will open at `http://localhost:3000`

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📱 Application Structure

```
DayFlow/
├── backend/
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── Payroll.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── leave.js
│   │   └── payroll.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── SignIn.js
│   │   │   ├── ChangePassword.js
│   │   │   ├── CreateEmployee.js
│   │   │   ├── EmployeeDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── Attendance.js
│   │   │   ├── LeaveManagement.js
│   │   │   ├── PayrollManagement.js
│   │   │   └── EmployeeList.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 👤 User Roles & Permissions

### Employee
- View personal dashboard
- Check-in/Check-out for attendance
- View attendance history
- Apply for leave
- View leave status
- View payroll information
- Edit limited profile fields (phone, address, profile picture)

### HR Officer / Admin
- All employee permissions
- **Create new employee accounts** with auto-generated credentials
- View all employees
- Manage employee profiles
- View all attendance records
- Approve/reject leave requests
- Manage payroll records
- Access admin dashboard

## 🎯 Getting Started

### First Time Setup

1. **Start MongoDB** - Ensure MongoDB is running
2. **Install Dependencies** - Run `npm install` in both backend and frontend
3. **Create Admin Account** - Run `node createAdmin.js` in the backend directory
4. **Start Servers** - Run backend (`npm run dev`) and frontend (`npm start`)

### Admin Login (First Time)

1. Navigate to `http://localhost:3000/signin`
2. Login with default admin credentials:
   - **Employee ID**: `OIADMN20230001`
   - **Password**: `admin123`
3. ⚠️ **Important**: Change the default password after first login!

### Creating New Employees

1. Login as Admin/HR
2. Click the **"Create Employee"** button on the Admin Dashboard
3. Fill in employee details (name, email, phone, position, department, etc.)
4. Click "Create Employee"
5. **Save the generated credentials** displayed in the modal:
   - Employee ID (e.g., OIJODO20220001)
   - Temporary Password (e.g., a7f3c8d1)
6. Share these credentials securely with the new employee

### Employee First Login

1. Receive Employee ID and temporary password from HR/Admin
2. Go to `http://localhost:3000/signin`
3. Enter Employee ID and temporary password
4. You'll be **automatically redirected** to change your password
5. Enter current password and create a new password
6. Login again with your new password

### Authentication System

DayFlow uses an **auto-generated Employee ID system** for enhanced security:

- **Employee ID Format**: `OI[FirstName2][LastName2][Year][SerialNum4]`
  - Example: John Doe joining 2022 → `OIJODO20220001`
- **No public registration** - Only Admin/HR can create accounts
- **System-generated passwords** - Random secure passwords for new employees
- **Forced password change** - New employees must change password on first login

📖 For detailed authentication documentation, see [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/create-employee  - Create new employee (Admin/HR only)
POST /api/auth/signin           - Login with Employee ID
PUT  /api/auth/change-password  - Change password
POST /api/auth/signin      - Login
GET  /api/auth/me          - Get current user
```

### Employees
```
GET    /api/employees        - Get all employees (Admin/HR)
GET    /api/employees/:id    - Get employee by ID
PUT    /api/employees/:id    - Update employee
DELETE /api/employees/:id    - Delete employee (Admin)
```

### Attendance
```
GET    /api/attendance           - Get attendance records
POST   /api/attendance           - Create attendance (Admin/HR)
POST   /api/attendance/checkin   - Employee check-in
POST   /api/attendance/checkout  - Employee check-out
PUT    /api/attendance/:id       - Update attendance (Admin/HR)
DELETE /api/attendance/:id       - Delete attendance (Admin)
```

### Leave
```
GET    /api/leave               - Get leave requests
POST   /api/leave               - Apply for leave
PUT    /api/leave/:id/review    - Approve/reject leave (Admin/HR)
DELETE /api/leave/:id           - Delete leave request
```

### Payroll
```
GET    /api/payroll      - Get payroll records
GET    /api/payroll/:id  - Get specific payroll
POST   /api/payroll      - Create payroll (Admin/HR)
PUT    /api/payroll/:id  - Update payroll (Admin/HR)
DELETE /api/payroll/:id  - Delete payroll (Admin)
```

## 🎨 Features Showcase

### Dashboard Views
- **Employee Dashboard**: Personal stats, quick attendance check-in, recent leave requests
- **Admin Dashboard**: Organization overview, attendance metrics, pending leave approvals

### Attendance Management
- Interactive calendar view
- Color-coded attendance status
- Work hours tracking
- Monthly statistics

### Leave Management
- Simple leave application form
- Real-time leave balance
- Status tracking (Pending/Approved/Rejected)
- Admin approval workflow

### Payroll System
- Detailed salary breakdown
- Earnings and deductions
- Payment history
- Professional salary slips view

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation
- XSS protection
- CORS configuration

## 📱 Responsive Design

DayFlow is fully responsive and works seamlessly on:
- 💻 Desktop
- 📱 Tablets
- 📞 Mobile devices

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows: Check Services
# Mac/Linux: sudo systemctl status mongod

# If not running, start it
# Mac/Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Backend (Port 5000)
# Find and kill the process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -ti:5000 | xargs kill

# Frontend (Port 3000)
# The React dev server will offer to use a different port
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

### Backend Deployment (Example: Heroku)
1. Create a Heroku app
2. Set environment variables
3. Deploy using Git

### Frontend Deployment (Example: Vercel)
1. Build the production version: `npm run build`
2. Deploy the build folder

### Database (MongoDB Atlas)
1. Create a free cluster
2. Update MONGODB_URI in .env

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Developer

Built with ❤️ using MERN Stack

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern HR systems
- Built with best practices and clean code

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation

---

**DayFlow** - Making every workday flow perfectly! ⚡
