# Quick Start Guide for DayFlow HRMS

## 🚀 Fast Setup (5 Minutes)

### Prerequisites Check
✅ Node.js installed? Run: `node --version` (Need v18+)  
✅ MongoDB installed? Run: `mongod --version` (Need v4.4+)

### Step 1: Install Dependencies

Open two terminal windows in the DayFlow folder.

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Start MongoDB

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Find MongoDB Server and click Start

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm start
```
✅ Frontend opens at http://localhost:3000

### Step 4: Create Your First Account

1. Browser opens automatically to http://localhost:3000
2. Click "Sign Up"
3. Fill in the form:
   - Employee ID: EMP001
   - Email: admin@dayflow.com
   - First Name: Admin
   - Last Name: User
   - Role: **Admin**
   - Password: admin123
4. Click "Create Account"
5. You're in! 🎉

## 🎯 What to Do Next?

### As Admin:
1. **Create Employees**: Go to Sign Up and create employee accounts
2. **View Dashboard**: See organization metrics
3. **Manage Attendance**: Add/view attendance records
4. **Handle Leaves**: Approve/reject leave requests
5. **Manage Payroll**: Add salary records

### As Employee:
1. **Check-In**: Click "Check In Now" on dashboard
2. **Apply Leave**: Navigate to Leave → Request Leave
3. **View Attendance**: Check your attendance calendar
4. **Check Payroll**: View your salary details

## 🔑 Test Accounts

After creating accounts, you can use:

**Admin:**
- Email: admin@dayflow.com
- Password: admin123

**Employee:**
- Email: employee@dayflow.com
- Password: employee123

## ⚡ Quick Tips

- **Backend must be running** for frontend to work
- **MongoDB must be running** for backend to work
- Check browser console (F12) for any errors
- Backend runs on port 5000, frontend on port 3000

## 🐛 Common Issues

**"Cannot connect to MongoDB"**
→ Start MongoDB service

**"Port 5000 already in use"**
→ Kill the process or change PORT in backend/.env

**"Module not found"**
→ Run `npm install` in that directory

**Frontend won't start**
→ Check if port 3000 is free

## 📚 Learn More

See the full README.md for:
- Detailed features
- API documentation
- Deployment guides
- Advanced configuration

---

**Need Help?** Check the main README.md file!

Happy HR Management! 🚀
