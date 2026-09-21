const Student = require('../models/Student');
const User = require('../models/User');
const { isValidName, isValidIndianPhone, cleanIndianPhone, isValidCGPA, isValidYear } = require('../utils/validation');

// @desc    Get logged in student profile
// @route   GET /api/students/profile
// @access  Private/Student
const getStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!student) {
      student = await Student.create({ user: req.user._id });
      student = await Student.findById(student._id).populate('user', 'name email');
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private/Student
const updateStudentProfile = async (req, res) => {
  try {
    const { phone, department, passingYear, cgpa, skills, bio, name } = req.body;

    if (!name || !phone || !department || !passingYear || !cgpa || !skills || !bio) {
      return res.status(400).json({ message: 'All profile fields are compulsory.' });
    }

    // Validate Student Name (A-Z, a-z and spaces only)
    if (!isValidName(name)) {
      return res.status(400).json({
        message: 'Name can only contain alphabetic letters (A-Z, a-z) and spaces. Numbers and special characters are not allowed.'
      });
    }

    // Validate Indian Mobile Phone Number
    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).'
      });
    }

    // Validate CGPA
    if (!isValidCGPA(cgpa)) {
      return res.status(400).json({ message: 'CGPA must be a valid number between 0.0 and 10.0.' });
    }

    // Validate Passing Year
    if (!isValidYear(passingYear)) {
      return res.status(400).json({ message: 'Passing year must be between 2000 and 2035.' });
    }

    // Update name in User model
    await User.findByIdAndUpdate(req.user._id, { name: name.trim() });

    let skillsArray = skills;
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (!skillsArray || skillsArray.length === 0) {
      return res.status(400).json({ message: 'At least one technical skill is required.' });
    }

    const updatedFields = {
      phone: cleanIndianPhone(phone),
      department: department.trim(),
      passingYear: parseInt(passingYear, 10),
      cgpa: parseFloat(cgpa),
      skills: skillsArray,
      bio: bio.trim()
    };

    let student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { $set: updatedFields },
      { new: true, upsert: true }
    ).populate('user', 'name email');

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student profile', error: error.message });
  }
};

// @desc    Upload student resume
// @route   POST /api/students/upload-resume
// @access  Private/Student
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl },
      { new: true }
    ).populate('user', 'name email');

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl,
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Resume upload failed', error: error.message });
  }
};

// @desc    Upload student profile picture (avatar)
// @route   POST /api/students/upload-avatar
// @access  Private/Student
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file (JPEG, PNG, WEBP)' });
    }

    const profilePicUrl = `/uploads/profile-pics/${req.file.filename}`;

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { profilePicUrl },
      { new: true }
    ).populate('user', 'name email');

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicUrl,
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile picture upload failed', error: error.message });
  }
};

// @desc    Upload student college ID card (I-Card)
// @route   POST /api/students/upload-id-card
// @access  Private/Student
const uploadIdCard = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid ID card file (PDF or Image)' });
    }

    const idCardUrl = `/uploads/id-cards/${req.file.filename}`;

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { idCardUrl },
      { new: true }
    ).populate('user', 'name email');

    res.json({
      message: 'College ID Card uploaded successfully',
      idCardUrl,
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'ID Card upload failed', error: error.message });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  uploadResume,
  uploadAvatar,
  uploadIdCard
};


