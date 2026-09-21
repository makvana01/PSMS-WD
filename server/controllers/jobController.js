const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');
const { isFutureOrToday } = require('../utils/validation');

// @desc    Get all jobs (with optional search and filters)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { search, location, status } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    // Only return approved jobs unless requester is an admin
    let isAdmin = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bca_awd_placement_system_secret_key_2026');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) {
        // public route, ignore invalid token
      }
    }

    if (!isAdmin) {
      query.approvalStatus = 'Approved';
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Job post not found (invalid ID)' });
    }
    const job = await Job.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!job) {
      return res.status(404).json({ message: 'Job post not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job details', error: error.message });
  }
};

// @desc    Create new job post
// @route   POST /api/jobs
// @access  Private/Company or Admin
const createJob = async (req, res) => {
  try {
    const { title, location, salary, eligibility, description, lastDate } = req.body;

    if (!title || !location || !salary || !eligibility || !description || !lastDate) {
      return res.status(400).json({ message: 'All job fields are required.' });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ message: 'Job title must be at least 3 characters long.' });
    }

    if (!isFutureOrToday(lastDate)) {
      return res.status(400).json({ message: 'Last application date cannot be in the past.' });
    }

    let companyName = req.user.name;
    // Fetch official company name if registered
    const companyProfile = await Company.findOne({ user: req.user._id });
    if (companyProfile && companyProfile.companyName) {
      companyName = companyProfile.companyName;
    }

    // Block job posting if company is not approved or deactivated
    if (req.user.role === 'company') {
      if (!companyProfile || companyProfile.status !== 'Approved' || companyProfile.status === 'Deactive' || req.user.status === 'Deactive') {
        return res.status(403).json({
          message: companyProfile?.status === 'Deactive' || req.user.status === 'Deactive'
            ? 'Your recruiter account is currently deactivated by the administrator.'
            : 'Your company account is pending administrative approval. You cannot post jobs yet.'
        });
      }

      // Check company profile completion
      if (!companyProfile.website || !companyProfile.location || !companyProfile.phone || !companyProfile.description) {
        return res.status(400).json({
          message: 'Please complete all company profile details (website, phone, location, description) before posting placement drives.'
        });
      }
    }

    const job = await Job.create({
      company: req.user._id,
      companyName,
      title: title.trim(),
      location: location.trim(),
      salary: salary.trim(),
      eligibility: eligibility.trim(),
      description: description.trim(),
      lastDate,
      status: 'Open',
      approvalStatus: req.user.role === 'admin' ? 'Approved' : 'Pending',
      isDeleted: false
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job post', error: error.message });
  }
};

// @desc    Update job post
// @route   PUT /api/jobs/:id
// @access  Private/Company or Admin
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    const job = await Job.findById(id);
    if (!job || job.isDeleted) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    // Check ownership unless admin
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const { title, location, salary, eligibility, description, lastDate, status, approvalStatus } = req.body;

    if (lastDate && !isFutureOrToday(lastDate)) {
      return res.status(400).json({ message: 'Last application date cannot be in the past.' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (salary !== undefined) updateFields.salary = salary.trim();
    if (eligibility !== undefined) updateFields.eligibility = eligibility.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (lastDate !== undefined) updateFields.lastDate = lastDate;
    if (status !== undefined && ['Open', 'Closed'].includes(status)) updateFields.status = status;

    // Only Admin can modify approvalStatus
    if (req.user.role === 'admin' && approvalStatus !== undefined) {
      if (['Pending', 'Approved', 'Rejected'].includes(approvalStatus)) {
        updateFields.approvalStatus = approvalStatus;
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job post', error: error.message });
  }
};

// @desc    Delete job post (Soft Delete)
// @route   DELETE /api/jobs/:id
// @access  Private/Company or Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership unless admin
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    // Soft Delete
    job.isDeleted = true;
    job.deletedAt = new Date();
    await job.save();

    res.json({ message: 'Job moved to Trash (Soft Deleted) successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job post', error: error.message });
  }
};

// @desc    Get jobs posted by logged-in company
// @route   GET /api/jobs/company/my-jobs
// @access  Private/Company
const getMyCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company jobs', error: error.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyCompanyJobs
};
