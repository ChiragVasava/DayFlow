const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Employee = require('./models/Employee');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dayflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleAttendance = async () => {
  try {
    console.log('Connected to MongoDB');
    
    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('No employees found. Please add employees first.');
      process.exit(0);
    }

    // Clear existing attendance records
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    const attendanceRecords = [];
    const today = new Date();
    
    // Create attendance records for the last 30 days
    for (let i = 0; i < 30; i++) {
      // Create date in UTC at midnight
      const date = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
        0, 0, 0, 0
      ));
      
      // Skip weekends
      if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
        continue;
      }

      for (const employee of employees) {
        // Random attendance pattern (80% present, 10% leave, 5% absent, 5% half-day)
        const random = Math.random();
        let status, checkIn, checkOut, workHours, remarks;

        if (random < 0.8) {
          // Present
          status = 'Present';
          // Check-in between 9:00-9:30 AM UTC
          checkIn = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            9, Math.floor(Math.random() * 30), 0
          ));
          
          // Check-out between 5:00-7:00 PM UTC
          checkOut = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0
          ));
          
          workHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours
          remarks = '';
        } else if (random < 0.9) {
          // On Leave
          status = 'Leave';
          checkIn = null;
          checkOut = null;
          workHours = 0;
          remarks = ['Sick Leave', 'Casual Leave', 'Personal Leave'][Math.floor(Math.random() * 3)];
        } else if (random < 0.95) {
          // Absent
          status = 'Absent';
          checkIn = null;
          checkOut = null;
          workHours = 0;
          remarks = 'Unplanned absence';
        } else {
          // Half-day
          status = 'Half-day';
          checkIn = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            9, Math.floor(Math.random() * 30), 0
          ));
          
          checkOut = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            13, Math.floor(Math.random() * 60), 0
          ));
          
          workHours = (checkOut - checkIn) / (1000 * 60 * 60);
          remarks = 'Half day - Personal work';
        }

        attendanceRecords.push({
          employee: employee._id,
          date: date,
          status: status,
          checkIn: checkIn,
          checkOut: checkOut,
          workHours: workHours,
          remarks: remarks
        });
      }
    }

    // Insert all attendance records
    await Attendance.insertMany(attendanceRecords);
    
    console.log(`\n✅ Successfully added ${attendanceRecords.length} attendance records`);
    console.log(`📊 Records per employee: ~${Math.floor(attendanceRecords.length / employees.length)}`);
    console.log(`📅 Date range: Last 30 working days`);
    
    // Show summary for each employee
    console.log('\n📋 Summary by Employee:');
    for (const employee of employees) {
      const employeeAttendance = attendanceRecords.filter(r => r.employee.equals(employee._id));
      const present = employeeAttendance.filter(r => r.status === 'Present').length;
      const leave = employeeAttendance.filter(r => r.status === 'Leave').length;
      const absent = employeeAttendance.filter(r => r.status === 'Absent').length;
      const halfDay = employeeAttendance.filter(r => r.status === 'Half-day').length;
      
      console.log(`\n${employee.firstName} ${employee.lastName} (${employee.employeeId}):`);
      console.log(`  Present: ${present} days`);
      console.log(`  Leave: ${leave} days`);
      console.log(`  Absent: ${absent} days`);
      console.log(`  Half-day: ${halfDay} days`);
      console.log(`  Total: ${employeeAttendance.length} records`);
    }
    
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample attendance:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

addSampleAttendance();
