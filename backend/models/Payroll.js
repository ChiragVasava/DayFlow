const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  allowances: {
    hra: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  bonuses: {
    type: Number,
    default: 0
  },
  grossSalary: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processed', 'Paid'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

// Compound index to ensure one record per employee per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Calculate gross and net salary before saving
payrollSchema.pre('save', function(next) {
  const totalAllowances = Object.values(this.allowances).reduce((sum, val) => sum + val, 0);
  const totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + val, 0);
  
  this.grossSalary = this.basicSalary + totalAllowances + this.bonuses;
  this.netSalary = this.grossSalary - totalDeductions;
  
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
