const Company = require('../models/Company');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { isValidIndianPhone, cleanIndianPhone, isValidUrl } = require('../utils/validation');

// @desc    Get logged in company profile
// @route   GET /api/companies/profile
// @access  Private/Company
const getCompanyProfile = async (req, res) => {
  try {
    let company = await Company.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!company) {
      company = await Company.create({
        user: req.user._id,
        companyName: req.user.name
      });
      company = await Company.findById(company._id).populate('user', 'name email');
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company profile', error: error.message });
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private/Company
const updateCompanyProfile = async (req, res) => {
  try {
    const { companyName, industry, website, location, phone, description } = req.body;

    if (!companyName || !industry || !website || !location || !phone || !description) {
      return res.status(400).json({ message: 'All company profile fields are compulsory.' });
    }

    // Validate Website URL
    if (!isValidUrl(website)) {
      return res.status(400).json({ message: 'Please enter a valid website URL.' });
    }

    // Validate Indian Phone Number
    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).'
      });
    }

    await User.findByIdAndUpdate(req.user._id, { name: companyName.trim() });
    // Update companyName in existing job postings too
    await Job.updateMany({ company: req.user._id }, { companyName: companyName.trim() });

    const updatedFields = {
      companyName: companyName.trim(),
      industry: industry.trim(),
      website: website.trim(),
      location: location.trim(),
      phone: cleanIndianPhone(phone),
      description: description.trim()
    };

    let company = await Company.findOneAndUpdate(
      { user: req.user._id },
      { $set: updatedFields },
      { new: true, upsert: true }
    ).populate('user', 'name email');

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company profile', error: error.message });
  }
};

// @desc    Get Company Dashboard Stats
// @route   GET /api/companies/stats
// @access  Private/Company
const getCompanyStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ company: req.user._id });
    const totalApplications = await Application.countDocuments({ company: req.user._id });
    const shortlistedCount = await Application.countDocuments({ company: req.user._id, status: 'Shortlisted' });
    const selectedCount = await Application.countDocuments({ company: req.user._id, status: 'Selected' });

    res.json({
      totalJobs,
      totalApplications,
      shortlistedCount,
      selectedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyStats
};
