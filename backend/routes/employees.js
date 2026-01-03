const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @route   GET /api/employees
// @desc    Get all employees (Admin/HR only)
// @access  Private
router.get('/', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const employees = await Employee.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Employees can only view their own profile unless they're Admin/HR
    if (req.employee.role === 'Employee' && req.employee._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Define fields that employees can update
    const employeeEditableFields = ['phoneNumber', 'address', 'profilePicture'];
    
    // Employees can only update their own limited fields
    if (req.employee.role === 'Employee' && req.employee._id.toString() === req.params.id) {
      // Filter to only allow editable fields
      const updates = {};
      employeeEditableFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      Object.assign(employee, updates);
    } 
    // Admin/HR can update all fields
    else if (req.employee.role === 'Admin' || req.employee.role === 'HR') {
      const { password, ...updates } = req.body;
      Object.assign(employee, updates);
    } 
    else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: employee.getPublicProfile()
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/employees/:id/photo
// @desc    Upload profile picture
// @access  Private
router.post('/:id/photo', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    // Users can only update their own photo unless they're Admin/HR
    if (req.employee.role === 'Employee' && req.employee._id.toString() !== req.params.id) {
      // Delete uploaded file if unauthorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old profile picture if exists
    if (employee.profilePicture) {
      const oldImagePath = path.join(__dirname, '..', employee.profilePicture.replace(/^\//, ''));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new profile picture path
    employee.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await employee.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      employee: employee.getPublicProfile()
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (Admin only)
// @access  Private
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/employees/:id/salary
// @desc    Update employee salary information (Admin/HR only)
// @access  Private
router.put('/:id/salary', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const { monthlyWage, workingDaysPerWeek, breakTimeHours } = req.body;

    if (!monthlyWage || monthlyWage <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid monthly wage is required'
      });
    }

    // Calculate all salary components
    const yearlyWage = monthlyWage * 12;
    const basicSalary = monthlyWage * 0.50;

    employee.salary = monthlyWage;
    employee.salaryInfo = {
      monthlyWage: monthlyWage,
      yearlyWage: yearlyWage,
      workingDaysPerWeek: workingDaysPerWeek || 5,
      breakTimeHours: breakTimeHours || 1,
      components: {
        basicSalary: {
          value: basicSalary,
          percentage: 50
        },
        houseRentAllowance: {
          value: basicSalary * 0.50,
          percentage: 50
        },
        standardAllowance: {
          value: monthlyWage * 0.1667,
          percentage: 16.67
        },
        performanceBonus: {
          value: monthlyWage * 0.0633,
          percentage: 6.33
        },
        leaveTravelAllowance: {
          value: monthlyWage * 0.0633,
          percentage: 6.33
        },
        fixedAllowance: {
          value: monthlyWage * 0.1167,
          percentage: 11.67
        }
      },
      providentFund: {
        employeeContribution: {
          value: basicSalary * 0.12,
          percentage: 12
        },
        employerContribution: {
          value: basicSalary * 0.12,
          percentage: 12
        }
      },
      taxDeductions: {
        professionalTax: req.body.professionalTax || 200,
        incomeTax: {
          value: req.body.incomeTaxValue || 0,
          percentage: req.body.incomeTaxPercentage || 0
        }
      }
    };

    await employee.save();

    res.json({
      success: true,
      message: 'Salary information updated successfully',
      employee: employee.getPublicProfile()
    });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
