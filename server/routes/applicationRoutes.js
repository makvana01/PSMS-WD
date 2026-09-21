const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getStudentApplications,
  getCompanyApplicants,
  getAllApplicationsAdmin,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/apply/:jobId', authorize('student'), applyForJob);
router.get('/student/my-applications', authorize('student'), getStudentApplications);
router.get('/company/applicants', authorize('company'), getCompanyApplicants);
router.get('/admin/all', authorize('admin'), getAllApplicationsAdmin);
router.put('/:id/status', authorize('company', 'admin'), updateApplicationStatus);

module.exports = router;
