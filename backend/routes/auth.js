const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const { generateToken, protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

// @route   POST /api/auth/create-employee
// @desc    Create a new employee (Admin/HR only)
// @access  Private (Admin/HR)
router.post('/create-employee', protect, authorize('Admin', 'HR'), [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('role').isIn(['Employee', 'HR', 'Admin']).withMessage('Invalid role'),
  body('dateOfJoining').notEmpty().withMessage('Date of joining is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, role, firstName, lastName, phoneNumber, department, designation, dateOfJoining, salary } = req.body;

    // Check if employee email already exists
    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Generate Employee ID: OI + first 2 letters of first name + first 2 letters of last name + year + serial
    const joiningYear = new Date(dateOfJoining).getFullYear();
    const namePrefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    
    // Find the last employee ID for this year
    const yearPrefix = `OI${namePrefix}${joiningYear}`;
    const lastEmployee = await Employee.findOne({ 
      employeeId: new RegExp(`^${yearPrefix}`) 
    }).sort({ employeeId: -1 });
    
    let serial = 1;
    if (lastEmployee) {
      const lastSerial = parseInt(lastEmployee.employeeId.slice(-4));
      serial = lastSerial + 1;
    }
    
    const employeeId = `${yearPrefix}${serial.toString().padStart(4, '0')}`;

    // Generate random password
    const generatedPassword = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create new employee
    const employeeData = {
      employeeId,
      email,
      password: generatedPassword,
      role,
      firstName,
      lastName,
      dateOfJoining,
      isVerified: true,
      isFirstLogin: true
    };

    if (phoneNumber) employeeData.phoneNumber = phoneNumber;
    if (department) employeeData.department = department;
    if (designation) employeeData.designation = designation;
    if (salary) employeeData.salary = salary;

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employeeId: employee.employeeId,
      generatedPassword: generatedPassword,
      employee: employee.getPublicProfile()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/signin
// @desc    Login employee using Employee ID
// @access  Public
router.post('/signin', [
  body('employeeId').notEmpty().trim().withMessage('Employee ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { employeeId, password } = req.body;

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await employee.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact HR.'
      });
    }

    // Generate token
    const token = generateToken(employee._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      isFirstLogin: employee.isFirstLogin,
      employee: employee.getPublicProfile()
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password (first login or regular)
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    const employee = await Employee.findById(req.employee._id).select('+password');

    // Verify current password
    const isMatch = await employee.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    employee.password = newPassword;
    employee.isFirstLogin = false;
    await employee.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in employee
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id).select('-password');
    
    res.json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
