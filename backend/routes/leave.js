const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/leave
// @desc    Get leave requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Employees can only see their own leaves
    if (req.employee.role === 'Employee') {
      query.employee = req.employee._id;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/leave
// @desc    Apply for leave
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if employee has sufficient leave balance
    const employee = await Employee.findById(req.employee._id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    // Initialize leave balance if not exists
    if (!employee.leaveBalance) {
      employee.leaveBalance = { paid: 20, sick: 10 };
      await employee.save();
    }
    
    const paidBalance = employee.leaveBalance.paid || 0;
    const sickBalance = employee.leaveBalance.sick || 0;
    
    if (leaveType === 'Paid' && paidBalance < days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient paid leave balance. Available: ${paidBalance} days`
      });
    }
    
    if (leaveType === 'Sick' && sickBalance < days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient sick leave balance. Available: ${sickBalance} days`
      });
    }
    
    const leave = await Leave.create({
      employee: req.employee._id,
      leaveType,
      startDate,
      endDate,
      numberOfDays: days,
      reason
    });
    
    await leave.populate('employee', 'firstName lastName employeeId');
    
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/leave/:id/review
// @desc    Approve or reject leave (Admin/HR only)
// @access  Private
router.put('/:id/review', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { status, reviewComments } = req.body;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Approved or Rejected'
      });
    }
    
    const leave = await Leave.findById(req.params.id).populate('employee');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been reviewed'
      });
    }
    
    leave.status = status;
    leave.reviewedBy = req.employee._id;
    leave.reviewedAt = new Date();
    leave.reviewComments = reviewComments;
    
    await leave.save();
    
    // Update employee leave balance if approved
    if (status === 'Approved') {
      const employee = leave.employee;
      const leaveTypeMap = {
        'Paid': 'paid',
        'Sick': 'sick',
        'Unpaid': 'unpaid'
      };
      
      const balanceField = leaveTypeMap[leave.leaveType];
      if (balanceField !== 'unpaid') {
        employee.leaveBalance[balanceField] -= leave.numberOfDays;
        await employee.save();
      }
    }
    
    await leave.populate('reviewedBy', 'firstName lastName');
    
    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()}`,
      leave
    });
  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/leave/:id
// @desc    Delete leave request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    // Employees can only delete their own pending leave requests
    if (req.employee.role === 'Employee') {
      if (leave.employee.toString() !== req.employee._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this leave request'
        });
      }
      
      if (leave.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a reviewed leave request'
        });
      }
    }
    
    await leave.deleteOne();
    
    res.json({
      success: true,
      message: 'Leave request deleted'
    });
  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
