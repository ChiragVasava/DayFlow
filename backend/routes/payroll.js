const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/payroll
// @desc    Get payroll records
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Employees can only see their own payroll
    if (req.employee.role === 'Employee') {
      query.employee = req.employee._id;
    } else if (req.query.employeeId) {
      query.employee = req.query.employeeId;
    }
    
    // Filter by month/year if provided
    if (req.query.month) query.month = req.query.month;
    if (req.query.year) query.year = req.query.year;
    
    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ year: -1, month: -1 });
    
    res.json({
      success: true,
      count: payrolls.length,
      payrolls
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payroll/:id
// @desc    Get single payroll record
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId department');
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    // Employees can only view their own payroll
    if (req.employee.role === 'Employee' && 
        payroll.employee._id.toString() !== req.employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payroll'
      });
    }
    
    res.json({
      success: true,
      payroll
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payroll
// @desc    Create payroll record (Admin/HR only)
// @access  Private
router.post('/', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const payrollData = {
      ...req.body,
      createdBy: req.employee._id
    };
    
    const payroll = await Payroll.create(payrollData);
    await payroll.populate('employee', 'firstName lastName employeeId department');
    
    res.status(201).json({
      success: true,
      message: 'Payroll record created',
      payroll
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Payroll record already exists for this employee and month'
      });
    }
    console.error('Create payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/payroll/:id
// @desc    Update payroll record (Admin/HR only)
// @access  Private
router.put('/:id', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    Object.assign(payroll, req.body);
    await payroll.save();
    await payroll.populate('employee', 'firstName lastName employeeId department');
    
    res.json({
      success: true,
      message: 'Payroll updated successfully',
      payroll
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/payroll/:id
// @desc    Delete payroll record (Admin only)
// @access  Private
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    await payroll.deleteOne();
    
    res.json({
      success: true,
      message: 'Payroll record deleted'
    });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
