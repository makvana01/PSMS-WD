const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/students', getAllStudents);
router.get('/companies', getAllCompanies);
router.delete('/students/:id', deleteStudent);
router.delete('/companies/:id', deleteCompany);
router.delete('/jobs/:id', deleteJobAdmin);

router.get('/trash', getTrashRecords);
router.put('/restore/:type/:id', restoreRecord);
router.delete('/hard-delete/:type/:id', hardDeleteRecord);
router.put('/status/:type/:id', toggleUserStatus);

router.put('/companies/:id/status', updateCompanyStatus);
router.put('/jobs/:id/status', updateJobStatus);
router.put('/jobs/:id', updateJobAdmin);
router.put('/students/:id', updateStudentDetailsAdmin);
router.put('/companies/:id', updateCompanyDetailsAdmin);

module.exports = router;


