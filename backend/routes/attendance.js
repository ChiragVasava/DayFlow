const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    console.log('📅 Attendance GET request:', { startDate, endDate, employeeId, role: req.employee?.role });
    
    let query = {};
    
    // Build query based on role
    if (req.employee.role === 'Employee') {
      query.employee = req.employee._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }
    
    // Date range filter with proper timezone handling
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lt: new Date(endDate)
      };
    }
    
    console.log('📊 Query:', JSON.stringify(query, null, 2));
    
    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });
    
    console.log('✅ Found attendance records:', attendance.length);
    
    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/attendance/checkin
// @desc    Employee check-in
// @access  Private
router.post('/checkin', protect, async (req, res) => {
  try {
    // Get today's date in UTC at midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.employee._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }
    
    const attendance = await Attendance.create({
      employee: req.employee._id,
      date: today,
      status: 'Present',
      checkIn: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Employee check-out
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  try {
    // Get today's date in UTC at midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    
    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }
    
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }
    
    attendance.checkOut = new Date();
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/attendance
// @desc    Create attendance record (Admin/HR only)
// @access  Private
router.post('/', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, remarks } = req.body;
    
    const attendance = await Attendance.create({
      employee,
      date,
      status,
      checkIn,
      checkOut,
      remarks,
      createdBy: req.employee._id
    });
    
    await attendance.populate('employee', 'firstName lastName employeeId');
    
    res.status(201).json({
      success: true,
      message: 'Attendance record created',
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }
    console.error('Create attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (Admin/HR only)
// @access  Private
router.put('/:id', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    Object.assign(attendance, req.body);
    await attendance.save();
    await attendance.populate('employee', 'firstName lastName employeeId');
    
    res.json({
      success: true,
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record (Admin only)
// @access  Private
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    await attendance.deleteOne();
    
    res.json({
      success: true,
      message: 'Attendance record deleted'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
