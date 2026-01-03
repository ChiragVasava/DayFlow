# DayFlow - Auto-Generated Employee ID System

## Overview
DayFlow now uses an auto-generated Employee ID system for enhanced security and centralized employee management.

## Key Features

### 🔐 Auto-Generated Employee IDs
- **Format**: `OI[FirstName2][LastName2][Year][Serial]`
- **Example**: `OIJODO20220001` (for John Doe joining in 2022)
- Company prefix: `OI`
- First 2 letters of first name + first 2 letters of last name
- Year of joining (4 digits)
- Sequential serial number (4 digits)

### 🔑 System-Generated Passwords
- Random 8-character hexadecimal password
- Generated automatically during employee creation
- Must be changed on first login

### 👤 Employee Creation (Admin/HR Only)
- Normal users **cannot** register themselves
- Only Admin and HR roles can create new employees
- Credentials are displayed once after creation

## Authentication Flow

### For Admin/HR:
1. Login with your Employee ID and password
2. Navigate to "Create Employee" from the dashboard
3. Fill in employee details (name, email, phone, position, department, joining date, salary)
4. Click "Create Employee"
5. **Save the generated credentials** - they're shown only once!
6. Share credentials securely with the new employee

### For New Employees:
1. Receive Employee ID and temporary password from HR/Admin
2. Go to the login page
3. Enter Employee ID (e.g., `OIJODO20220001`)
4. Enter temporary password
5. You'll be **automatically redirected** to change your password
6. Enter current password and new password (min 6 characters)
7. After password change, login again with your new password

## API Endpoints

### Create Employee (Admin/HR Only)
```
POST /api/auth/create-employee
Authorization: Bearer <admin_token>

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phoneNumber": "+1234567890",
  "position": "Software Engineer",
  "department": "Engineering",
  "salary": 75000,
  "joiningDate": "2022-01-15"
}

Response:
{
  "success": true,
  "message": "Employee created successfully",
  "employeeId": "OIJODO20220001",
  "generatedPassword": "a7f3c8d1",
  "employee": { ... }
}
```

### Sign In with Employee ID
```
POST /api/auth/signin

Body:
{
  "employeeId": "OIJODO20220001",
  "password": "your_password"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "isFirstLogin": true,
  "employee": { ... }
}
```

### Change Password
```
PUT /api/auth/change-password
Authorization: Bearer <token>

Body:
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Frontend Routes

### Public Routes
- `/signin` - Login page (Employee ID required)

### Protected Routes
- `/change-password` - Password change page (all users)
- `/dashboard` - Employee dashboard
- `/profile` - Employee profile
- `/attendance` - Attendance tracking
- `/leave` - Leave management
- `/payroll` - Payroll information

### Admin/HR Routes
- `/admin/dashboard` - Admin dashboard with "Create Employee" button
- `/create-employee` - Employee creation form
- `/employees` - Employee list

## Security Features

✅ **No Public Registration** - Prevents unauthorized access
✅ **System-Generated IDs** - Ensures unique, consistent employee identifiers
✅ **Random Passwords** - Secure initial credentials
✅ **Forced Password Change** - Users must set their own password on first login
✅ **Role-Based Access** - Only Admin/HR can create employees
✅ **JWT Authentication** - Secure token-based auth

## Database Schema Updates

### Employee Model
```javascript
{
  employeeId: String, // Auto-generated unique ID
  isFirstLogin: Boolean, // Tracks if password needs change
  // ... other fields
}
```

## Testing the System

### 1. Create an Admin/HR Account (Initial Setup)
Since the signup route is removed, you need to manually create an admin account in MongoDB:

```javascript
// Connect to MongoDB and run:
db.employees.insertOne({
  employeeId: "OIADMN20230001",
  firstName: "Admin",
  lastName: "User",
  email: "admin@dayflow.com",
  password: "$2a$10$...", // Use bcrypt to hash a password
  role: "Admin",
  department: "Management",
  designation: "System Administrator",
  dateOfJoining: new Date(),
  isVerified: true,
  isActive: true,
  isFirstLogin: false,
  leaveBalance: { annual: 20, sick: 10, casual: 5 }
});
```

Or use a script to create the first admin:

```javascript
// scripts/createAdmin.js
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/dayflow');
  
  const admin = await Employee.create({
    employeeId: 'OIADMN20230001',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@dayflow.com',
    password: 'admin123', // Will be hashed by pre-save hook
    role: 'Admin',
    department: 'Management',
    designation: 'System Administrator',
    dateOfJoining: new Date(),
    isVerified: true,
    isActive: true,
    isFirstLogin: false
  });
  
  console.log('Admin created:', admin.employeeId);
  process.exit(0);
}

createAdmin();
```

### 2. Test Employee Creation Flow
1. Login as Admin/HR
2. Click "Create Employee" button on dashboard
3. Fill in all fields and submit
4. **Copy the generated credentials** from the modal
5. Logout

### 3. Test First-Time Login
1. Login with generated Employee ID
2. Enter temporary password
3. Verify redirect to "Change Password" page
4. Enter current password and new password
5. Verify logout and redirect to signin
6. Login again with new password

### 4. Verify Regular Login
1. Login with Employee ID and your custom password
2. Verify direct access to dashboard (no password change redirect)

## Migration from Old System

If you have existing employees with email-based login:

1. Create a migration script to generate employee IDs:
```javascript
// scripts/migrateToEmployeeIds.js
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

async function migrateEmployees() {
  await mongoose.connect('mongodb://localhost:27017/dayflow');
  
  const employees = await Employee.find({});
  
  for (const emp of employees) {
    if (!emp.employeeId) {
      const year = emp.dateOfJoining.getFullYear();
      const firstTwo = emp.firstName.substring(0, 2).toUpperCase();
      const lastTwo = emp.lastName.substring(0, 2).toUpperCase();
      
      // Find highest serial number for this year
      const pattern = `^OI${firstTwo}${lastTwo}${year}`;
      const existing = await Employee.find({
        employeeId: { $regex: pattern }
      }).sort({ employeeId: -1 }).limit(1);
      
      let serial = 1;
      if (existing.length > 0) {
        const lastSerial = parseInt(existing[0].employeeId.slice(-4));
        serial = lastSerial + 1;
      }
      
      emp.employeeId = `OI${firstTwo}${lastTwo}${year}${serial.toString().padStart(4, '0')}`;
      emp.isFirstLogin = false; // Existing users don't need password change
      await emp.save();
      
      console.log(`Migrated ${emp.firstName} ${emp.lastName} -> ${emp.employeeId}`);
    }
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrateEmployees();
```

## Troubleshooting

### Issue: Can't login with Employee ID
- Verify the Employee ID is correct (case-sensitive)
- Check if the account exists in the database
- Ensure the account is active (`isActive: true`)

### Issue: Not redirected to change password on first login
- Check backend response includes `isFirstLogin: true`
- Verify `isFirstLogin` field exists in Employee model
- Check browser console for errors

### Issue: "Create Employee" button not visible
- Ensure logged-in user has role "Admin" or "HR"
- Check PrivateRoute authorization logic
- Verify user token includes correct role

### Issue: Auto-generated ID collision
- The system checks for existing IDs and increments serial number
- If collision occurs, check database for duplicate entries
- Verify employee creation logic in backend/routes/auth.js

## Benefits of This System

1. **Centralized Control**: HR/Admin manages all employee accounts
2. **Consistent Identifiers**: Standardized ID format across organization
3. **Better Security**: Prevents unauthorized registrations
4. **Audit Trail**: Clear tracking of who was created when
5. **Professional**: Mimics enterprise HRMS systems
6. **Scalable**: Easy to extend with more ID formats or rules

## Future Enhancements

- [ ] Bulk employee import via CSV
- [ ] Email notification to new employees with credentials
- [ ] Password reset via email
- [ ] Employee ID format customization per department
- [ ] Biometric authentication integration
- [ ] SSO (Single Sign-On) support
- [ ] Two-factor authentication (2FA)
