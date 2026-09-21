const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job Title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  salary: {
    type: String,
    required: [true, 'Salary package is required']
  },
  eligibility: {
    type: String,
    required: [true, 'Eligibility criterion is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  lastDate: {
    type: Date,
    required: [true, 'Last Application Date is required']
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);


