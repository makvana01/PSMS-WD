const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyCompanyJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Specific protected sub-routes (MUST precede parameterized /:id route)
router.get('/company/my-jobs', protect, authorize('company'), getMyCompanyJobs);

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected mutation routes
router.post('/', protect, authorize('company', 'admin'), createJob);
router.put('/:id', protect, authorize('company', 'admin'), updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), deleteJob);

module.exports = router;

