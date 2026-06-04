const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Employee', 'HR', 'Admin'],
    default: 'Employee'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: {
    type: Date
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  salary: {
    type: Number,
    default: 0
  },
  salaryInfo: {
    monthlyWage: {
      type: Number,
      default: 0
    },
    yearlyWage: {
      type: Number,
      default: 0
    },
    workingDaysPerWeek: {
      type: Number,
      default: 5
    },
    breakTimeHours: {
      type: Number,
      default: 1
    },
    components: {
      basicSalary: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 50 }
      },
      houseRentAllowance: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 50 }
      },
      standardAllowance: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 16.67 }
      },
      performanceBonus: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 6.33 }
      },
      leaveTravelAllowance: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 6.33 }
      },
      fixedAllowance: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 11.67 }
      }
    },
    providentFund: {
      employeeContribution: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 12 }
      },
      employerContribution: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 12 }
      }
    },
    taxDeductions: {
      professionalTax: {
        type: Number,
        default: 200
      },
      incomeTax: {
        value: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      }
    }
  },
  privateInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', '']
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', '']
    },
    nationality: String,
    personalEmail: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    panNumber: String,
    uanNumber: String,
    employeeCode: String
  },
  profilePicture: {
    type: String,
    default: ''
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  leaveBalance: {
    paid: {
      type: Number,
      default: 20
    },
    sick: {
      type: Number,
      default: 10
    },
    unpaid: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
employeeSchema.methods.getPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Employee', employeeSchema);
