const express = require('express');
const router = express.Router();
const {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyStats
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('company'));

router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.get('/stats', getCompanyStats);

module.exports = router;
