const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Paid', 'Sick', 'Unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reviewedAt: {
    type: Date
  },
  reviewComments: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate number of days before saving
leaveSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
    this.numberOfDays = days;
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
