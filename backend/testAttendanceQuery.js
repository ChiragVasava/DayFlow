const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');

mongoose.connect('mongodb://localhost:27017/dayflow').then(async () => {
  console.log('Connected to database');
  
  const today = new Date('2026-01-03T00:00:00.000Z');
  const tomorrow = new Date('2026-01-04T00:00:00.000Z');
  
  console.log('Querying for date range:', today, 'to', tomorrow);
  
  const records = await Attendance.find({
    date: {
      $gte: today,
      $lt: tomorrow
    }
  }).populate('employee', 'firstName lastName employeeId');
  
  console.log('Found records:', records.length);
  
  if (records.length > 0) {
    console.log('Sample record:', {
      date: records[0].date,
      employee: records[0].employee,
      status: records[0].status,
      checkIn: records[0].checkIn,
      checkOut: records[0].checkOut
    });
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
