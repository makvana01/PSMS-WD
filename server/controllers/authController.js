const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const PendingUser = require('../models/PendingUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');
const { getStudentOtpTemplate, getCompanyOtpTemplate } = require('../utils/emailTemplates');
const { isValidName, isValidEmail, isValidPassword, isValidIndianPhone, cleanIndianPhone } = require('../utils/validation');

// Helper to send OTP email
const sendOtpEmail = async (email, otp, role = 'student', name = 'User') => {
  // Select styling template based on role
  const htmlContent = role === 'company' 
    ? getCompanyOtpTemplate(name, otp) 
    : getStudentOtpTemplate(name, otp);

  await sendEmail({
    to: email,
    subject: role === 'company' ? 'Partner Registration - PlacementHub' : 'Verify Your PlacementHub Account',
    html: htmlContent
  });
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bca_awd_placement_system_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Student or Company)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate Name (A-Z, a-z and spaces only)
    if (!isValidName(name)) {
      return res.status(400).json({
        message: 'Name can only contain alphabetic letters (A-Z, a-z) and spaces. Numbers and special characters are not allowed.'
      });
    }

    // Validate Indian Mobile Number (if provided)
    if (phone && !isValidIndianPhone(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).'
      });
    }

    // Validate Email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Validate Strong Password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter (A-Z), one number (0-9), and one special character (!@#$%^&*).'
      });
    }

    if (role === 'company' && (!companyName || !companyName.trim())) {
      return res.status(400).json({ message: 'Company name is required for recruiter registration.' });
    }

    // Check if user already exists in verified users collection
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing pending registration for this email
    await PendingUser.deleteMany({ email: email.toLowerCase().trim() });

    // Create pending user (No records created in User, Student, or Company)
    const userRole = role === 'company' ? 'company' : 'student';
    await PendingUser.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? cleanIndianPhone(phone) : '',
      password: hashedPassword,
      role: userRole,
      companyName: userRole === 'company' ? companyName.trim() : undefined,
      otp,
      otpExpires
    });

    // Send OTP Email
    await sendOtpEmail(email, otp, userRole, userRole === 'company' ? (companyName || name) : name);

    res.status(201).json({
      message: 'OTP sent to your email. Please verify.',
      email: email.toLowerCase().trim()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Check if user exists in PendingUser
      const pendingUser = await PendingUser.findOne({ email });
      if (pendingUser) {
        // Generate a new OTP and resend
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        pendingUser.otp = newOtp;
        pendingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await pendingUser.save();
        await sendOtpEmail(email, newOtp, pendingUser.role, pendingUser.role === 'company' ? (pendingUser.companyName || pendingUser.name) : pendingUser.name);

        return res.status(403).json({
          message: 'Account not verified. A new OTP has been sent to your email.',
          unverified: true,
          email: pendingUser.email
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account has been deleted. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || (user.role === 'admin' ? 'Active' : 'Deactive'),
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Verify OTP for registration
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide both email and OTP' });
    }

    // Check if user is already verified and exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ message: 'Registration session expired or not found. Please register again.' });
    }

    if (pendingUser.otp !== otp || pendingUser.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid! Create actual User record now with default Deactive status (Admin confirmation required)
    const initialStatus = pendingUser.role === 'admin' ? 'Active' : 'Deactive';
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isVerified: true,
      status: initialStatus
    });

    // Create the profile based on role
    if (user.role === 'student') {
      await Student.create({
        user: user._id,
        phone: pendingUser.phone || '',
        department: 'BCA',
        passingYear: 2026,
        cgpa: 0,
        skills: [],
        status: 'Deactive'
      });
    } else if (user.role === 'company') {
      await Company.create({
        user: user._id,
        companyName: pendingUser.companyName || pendingUser.name,
        phone: pendingUser.phone || '',
        industry: 'Information Technology',
        location: '',
        website: '',
        status: 'Deactive'
      });
    }

    // Delete pending record
    await PendingUser.deleteOne({ _id: pendingUser._id });

    res.status(200).json({
      message: 'Email verified and account registered! Your account is in Deactive status pending administrative verification and activation.',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: initialStatus,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during OTP verification', error: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ message: 'Registration session expired or not found. Please register again.' });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUser.otp = newOtp;
    pendingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await pendingUser.save();

    await sendOtpEmail(email, newOtp, pendingUser.role, pendingUser.role === 'company' ? (pendingUser.companyName || pendingUser.name) : pendingUser.name);

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during OTP resend', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'company') {
      profile = await Company.findOne({ user: user._id });
    }

    res.json({
      user,
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  verifyOtp,
  resendOtp
};
