const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private/Student
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Verify User Account Active Status
    const user = await User.findById(req.user._id);
    if (!user || user.status === 'Deactive' || user.isDeleted) {
      return res.status(403).json({
        message: 'Your student account is currently deactivated by the administrator. Please contact the placement department.'
      });
    }

    // 2. Verify Student Profile Completeness (compulsory details + Resume + ID Card)
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({
        message: 'Student profile not found. Please complete your profile first.',
        incompleteProfile: true
      });
    }

    if (student.status === 'Deactive') {
      return res.status(403).json({
        message: 'Your student profile is currently deactivated by the administrator.'
      });
    }

    const isIncomplete =
      !student.phone ||
      !student.department ||
      !student.passingYear ||
      student.cgpa === undefined ||
      student.cgpa === null ||
      !student.skills ||
      student.skills.length === 0 ||
      !student.bio ||
      !student.resumeUrl ||
      !student.idCardUrl;

    if (isIncomplete) {
      let missingList = [];
      if (!student.phone) missingList.push('Mobile Number');
      if (!student.department) missingList.push('Department');
      if (!student.passingYear) missingList.push('Passing Year');
      if (student.cgpa === undefined || student.cgpa === null) missingList.push('CGPA Score');
      if (!student.skills || student.skills.length === 0) missingList.push('Technical Skills');
      if (!student.bio) missingList.push('Short Bio');
      if (!student.resumeUrl) missingList.push('Resume (PDF)');
      if (!student.idCardUrl) missingList.push('College ID Card (I-Card)');

      return res.status(400).json({
        message: `Profile incomplete! Compulsory items missing: ${missingList.join(', ')}. Please complete your profile before applying.`,
        incompleteProfile: true,
        missingList
      });
    }

    if (!jobId || !jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Invalid Job ID' });
    }

    const job = await Job.findById(jobId);
    if (!job || job.isDeleted) {
      return res.status(404).json({ message: 'Job not found or has been removed.' });
    }

    if (job.approvalStatus !== 'Approved') {
      return res.status(400).json({ message: 'This placement drive is not yet approved by the administrator.' });
    }

    if (job.status === 'Closed') {
      return res.status(400).json({ message: 'This job posting is closed for applications.' });
    }

    if (job.lastDate) {
      const deadline = new Date(job.lastDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        return res.status(400).json({ message: 'The application deadline for this position has passed.' });
      }
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      student: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      company: job.company,
      status: 'Applied'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
};

// @desc    Get applied jobs for logged in student
// @route   GET /api/applications/student/my-applications
// @access  Private/Student
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job')
      .populate('company', 'name email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// @desc    Get applicants for company's jobs
// @route   GET /api/applications/company/applicants
// @access  Private/Company
const getCompanyApplicants = async (req, res) => {
  try {
    const applications = await Application.find({ company: req.user._id })
      .populate('job')
      .populate('student', 'name email')
      .sort({ appliedAt: -1 });

    // Attach student profile info (skills, CGPA, resumeUrl, department)
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const studentProfile = app.student ? await Student.findOne({ user: app.student._id }) : null;
        return {
          ...app.toObject(),
          studentProfile: studentProfile || null
        };
      })
    );

    res.json(enrichedApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applicants', error: error.message });
  }
};

// @desc    Get all applications for Admin
// @route   GET /api/applications/admin/all
// @access  Private/Admin
const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job')
      .populate('student', 'name email')
      .populate('company', 'name email')
      .sort({ appliedAt: -1 });

    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const studentProfile = app.student ? await Student.findOne({ user: app.student._id }) : null;
        return {
          ...app.toObject(),
          studentProfile: studentProfile || null
        };
      })
    );

    res.json(enrichedApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all applications', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Company or Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Invalid Application ID' });
    }

    const { status } = req.body;
    if (!['Applied', 'Shortlisted', 'Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify company authorization unless admin
    if (application.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application status' });
    }

    application.status = status;
    await application.save();

    res.json({ message: `Application status updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};

module.exports = {
  applyForJob,
  getStudentApplications,
  getCompanyApplicants,
  getAllApplicationsAdmin,
  updateApplicationStatus
};
