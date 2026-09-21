const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'BCA'
  },
  passingYear: {
    type: Number,
    default: 2026
  },
  cgpa: {
    type: Number,
    default: 0.0
  },
  skills: [{
    type: String
  }],
  resumeUrl: {
    type: String,
    default: ''
  },
  idCardUrl: {
    type: String,
    default: ''
  },
  profilePicUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Deactive'],
    default: 'Deactive'
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

module.exports = mongoose.model('Student', studentSchema);


