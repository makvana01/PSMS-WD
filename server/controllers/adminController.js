const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  isValidName,
  isValidIndianPhone,
  cleanIndianPhone,
  isValidCGPA,
  isValidYear,
  isValidUrl
} = require('../utils/validation');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isDeleted: { $ne: true } });
    const totalCompanies = await User.countDocuments({ role: 'company', isDeleted: { $ne: true } });
    const totalJobs = await Job.countDocuments({ isDeleted: { $ne: true } });
    const totalApplications = await Application.countDocuments();
    const pendingCompaniesCount = await Company.countDocuments({ 
      status: { $in: ['Pending', 'Deactive'] }, 
      isDeleted: { $ne: true } 
    });
    const pendingJobsCount = await Job.countDocuments({ approvalStatus: 'Pending', isDeleted: { $ne: true } });

    // Trash counts
    const deletedStudentsCount = await Student.countDocuments({ isDeleted: true });
    const deletedCompaniesCount = await Company.countDocuments({ isDeleted: true });
    const deletedJobsCount = await Job.countDocuments({ isDeleted: true });
    const totalTrashCount = deletedStudentsCount + deletedCompaniesCount + deletedJobsCount;

    res.json({
      totalStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingCompaniesCount,
      pendingJobsCount,
      totalTrashCount,
      deletedStudentsCount,
      deletedCompaniesCount,
      deletedJobsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// @desc    Get all active students with user details
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: { $ne: true } }).populate('user', 'name email status createdAt isDeleted');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// @desc    Get all active companies with user details
// @route   GET /api/admin/companies
// @access  Private/Admin
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isDeleted: { $ne: true } }).populate('user', 'name email status createdAt isDeleted');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

// @desc    Soft delete a student user (Moves to Trash)
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    let userId = req.params.id;
    let student = await Student.findOne({ user: userId });
    if (!student) {
      student = await Student.findById(userId);
      if (student) userId = student.user;
    }

    if (student) {
      student.isDeleted = true;
      student.deletedAt = new Date();
      await student.save();
    }
    await User.findByIdAndUpdate(userId, { isDeleted: true });

    res.json({ message: 'Student account moved to Recycle Bin (Soft Deleted)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

// @desc    Soft delete a company user (Moves to Trash)
// @route   DELETE /api/admin/companies/:id
// @access  Private/Admin
const deleteCompany = async (req, res) => {
  try {
    let userId = req.params.id;
    let company = await Company.findOne({ user: userId });
    if (!company) {
      company = await Company.findById(userId);
      if (company) userId = company.user;
    }

    if (company) {
      company.isDeleted = true;
      company.deletedAt = new Date();
      await company.save();
    }
    await User.findByIdAndUpdate(userId, { isDeleted: true });
    // Also soft-delete company's jobs
    await Job.updateMany(
      { company: userId },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.json({ message: 'Company recruiter account moved to Recycle Bin (Soft Deleted)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
};

// @desc    Soft delete a job post (Moves to Trash)
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
const deleteJobAdmin = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId || !jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Invalid Job ID format' });
    }
    const job = await Job.findByIdAndUpdate(
      jobId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job post not found' });
    }
    res.json({ message: 'Job post moved to Recycle Bin (Soft Deleted)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job post', error: error.message });
  }
};

// @desc    Get all soft-deleted items (Recycle Bin)
// @route   GET /api/admin/trash
// @access  Private/Admin
const getTrashRecords = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: true }).populate('user', 'name email status createdAt');
    const companies = await Company.find({ isDeleted: true }).populate('user', 'name email status createdAt');
    const jobs = await Job.find({ isDeleted: true });

    res.json({
      students,
      companies,
      jobs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trash records', error: error.message });
  }
};

// @desc    Restore a soft-deleted item ("Add back to website")
// @route   PUT /api/admin/restore/:type/:id
// @access  Private/Admin
const restoreRecord = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'student') {
      let userId = id;
      let student = await Student.findOne({ user: userId });
      if (!student) {
        student = await Student.findById(userId);
        if (student) userId = student.user;
      }
      if (student) {
        student.isDeleted = false;
        student.deletedAt = null;
        await student.save();
      }
      await User.findByIdAndUpdate(userId, { isDeleted: false });
      return res.json({ message: 'Student account restored successfully!' });
    } else if (type === 'company') {
      let userId = id;
      let company = await Company.findOne({ user: userId });
      if (!company) {
        company = await Company.findById(userId);
        if (company) userId = company.user;
      }
      if (company) {
        company.isDeleted = false;
        company.deletedAt = null;
        await company.save();
      }
      await User.findByIdAndUpdate(userId, { isDeleted: false });
      await Job.updateMany(
        { company: userId },
        { isDeleted: false, deletedAt: null }
      );
      return res.json({ message: 'Company account and associated jobs restored successfully!' });
    } else if (type === 'job') {
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({ message: 'Invalid Job ID format' });
      }
      await Job.findByIdAndUpdate(
        id,
        { isDeleted: false, deletedAt: null }
      );
      return res.json({ message: 'Job placement drive restored successfully!' });
    } else {
      return res.status(400).json({ message: 'Invalid restore item type' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error restoring record', error: error.message });
  }
};

// @desc    Permanently delete an item (Hard Delete)
// @route   DELETE /api/admin/hard-delete/:type/:id
// @access  Private/Admin
const hardDeleteRecord = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'student') {
      let userId = id;
      let student = await Student.findOne({ user: userId });
      if (!student) {
        student = await Student.findById(userId);
        if (student) userId = student.user;
      }
      await Student.deleteMany({ user: userId });
      if (student) await Student.findByIdAndDelete(student._id);
      await Application.deleteMany({ student: userId });
      await User.findByIdAndDelete(userId);
      return res.json({ message: 'Student permanently deleted from database.' });
    } else if (type === 'company') {
      let userId = id;
      let company = await Company.findOne({ user: userId });
      if (!company) {
        company = await Company.findById(userId);
        if (company) userId = company.user;
      }
      await Company.deleteMany({ user: userId });
      if (company) await Company.findByIdAndDelete(company._id);
      await Job.deleteMany({ company: userId });
      await Application.deleteMany({ company: userId });
      await User.findByIdAndDelete(userId);
      return res.json({ message: 'Company and all associated jobs/applications permanently deleted.' });
    } else if (type === 'job') {
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({ message: 'Invalid Job ID format' });
      }
      await Application.deleteMany({ job: id });
      await Job.findByIdAndDelete(id);
      return res.json({ message: 'Job and applicant submissions permanently deleted.' });
    } else {
      return res.status(400).json({ message: 'Invalid hard delete item type' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error performing permanent deletion', error: error.message });
  }
};

// @desc    Toggle user status (Active <-> Deactive)
// @route   PUT /api/admin/status/:type/:id
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status } = req.body; // 'Active' or 'Deactive'

    if (!['Active', 'Deactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be Active or Deactive.' });
    }

    if (type === 'student') {
      // Check if id is Student._id or User._id
      let student = await Student.findOne({ user: id });
      let userId = id;
      if (!student) {
        student = await Student.findById(id);
        if (student) {
          userId = student.user;
        }
      }

      await User.findByIdAndUpdate(userId, { status });
      if (student) {
        student.status = status;
        await student.save();
      }
    } else if (type === 'company') {
      let company = await Company.findOne({ user: id });
      let userId = id;
      if (!company) {
        company = await Company.findById(id);
        if (company) {
          userId = company.user;
        }
      }

      await User.findByIdAndUpdate(userId, { status });
      if (company) {
        company.status = status === 'Deactive' ? 'Deactive' : 'Approved';
        await company.save();
      }
    }

    res.json({ message: `Account status updated to ${status}`, status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};


// @desc    Update company status (Approve/Reject/Deactive)
// @route   PUT /api/admin/companies/:id/status
// @access  Private/Admin
const updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected', 'Deactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const company = await Company.findOneAndUpdate(
      { user: req.params.id },
      { status },
      { new: true }
    );
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Synchronize User model status
    const userStatus = status === 'Deactive' ? 'Deactive' : 'Active';
    await User.findByIdAndUpdate(req.params.id, { status: userStatus });

    res.json({ message: `Company status updated to ${status}`, company });
  } catch (error) {
    res.status(500).json({ message: 'Error updating company status', error: error.message });
  }
};

// @desc    Update job approval status (Approve/Reject)
// @route   PUT /api/admin/jobs/:id/status
// @access  Private/Admin
const updateJobStatus = async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: `Job approval status updated to ${approvalStatus}`, job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job status', error: error.message });
  }
};

// @desc    Update job details (Admin Edit Job)
// @route   PUT /api/admin/jobs/:id
// @access  Private/Admin
const updateJobAdmin = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job post not found' });
    }
    res.json({ message: 'Job post updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job details', error: error.message });
  }
};

// @desc    Update student details (Admin Edit)
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudentDetailsAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, department, cgpa, passingYear, skills, bio, status } = req.body;

    if (!name || !phone || !department || !cgpa || !passingYear || !skills || !bio) {
      return res.status(400).json({ message: 'All profile fields are compulsory.' });
    }

    // Validate Student Name (A-Z, a-z only)
    if (!isValidName(name)) {
      return res.status(400).json({
        message: 'Name can only contain alphabetic letters (A-Z, a-z) and spaces. Numbers and special characters are not allowed.'
      });
    }

    // Validate Indian Phone Number
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

    const userUpdate = { name: name.trim() };
    if (status) userUpdate.status = status;
    await User.findByIdAndUpdate(userId, userUpdate);

    let skillsArray = skills;
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (!skillsArray || skillsArray.length === 0) {
      return res.status(400).json({ message: 'At least one technical skill is required.' });
    }

    const studentUpdate = {
      phone: cleanIndianPhone(phone),
      department: department.trim(),
      cgpa: parseFloat(cgpa),
      passingYear: parseInt(passingYear, 10),
      skills: skillsArray,
      bio: bio.trim()
    };
    if (status) studentUpdate.status = status;

    const student = await Student.findOneAndUpdate(
      { user: userId },
      { $set: studentUpdate },
      { new: true, upsert: true }
    ).populate('user', 'name email status');

    res.json({ message: 'Student details updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student details', error: error.message });
  }
};

// @desc    Update company details (Admin Edit)
// @route   PUT /api/admin/companies/:id
// @access  Private/Admin
const updateCompanyDetailsAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { companyName, industry, website, location, phone, description, status } = req.body;

    if (!companyName || !industry || !website || !location || !phone || !description) {
      return res.status(400).json({ message: 'All company profile fields are compulsory.' });
    }

    if (website && !isValidUrl(website)) {
      return res.status(400).json({ message: 'Please enter a valid website URL.' });
    }

    if (phone && !isValidIndianPhone(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).'
      });
    }

    const userUpdate = { name: companyName.trim() };
    if (status) {
      userUpdate.status = status === 'Deactive' ? 'Deactive' : 'Active';
    }
    await User.findByIdAndUpdate(userId, userUpdate);
    await Job.updateMany({ company: userId }, { companyName: companyName.trim() });

    const updatedFields = {
      companyName: companyName.trim(),
      industry: industry.trim(),
      website: website.trim(),
      location: location.trim(),
      phone: cleanIndianPhone(phone),
      description: description.trim()
    };

    if (status) {
      updatedFields.status = status;
    }

    const company = await Company.findOneAndUpdate(
      { user: userId },
      { $set: updatedFields },
      { new: true, upsert: true }
    ).populate('user', 'name email status');

    res.json({ message: 'Company details updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error updating company details', error: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllStudents,
  getAllCompanies,
  deleteStudent,
  deleteCompany,
  deleteJobAdmin,
  getTrashRecords,
  restoreRecord,
  hardDeleteRecord,
  toggleUserStatus,
  updateCompanyStatus,
  updateJobStatus,
  updateJobAdmin,
  updateStudentDetailsAdmin,
  updateCompanyDetailsAdmin
};

