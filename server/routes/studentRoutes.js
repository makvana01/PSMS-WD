const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  uploadResume,
  uploadAvatar,
  uploadIdCard
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const uploadProfilePic = require('../middleware/profilePicUploadMiddleware');
const uploadIdCardMiddleware = require('../middleware/idCardUploadMiddleware');

router.use(protect);

router.get('/profile', authorize('student'), getStudentProfile);
router.put('/profile', authorize('student'), updateStudentProfile);
router.post('/upload-resume', authorize('student'), upload.single('resume'), uploadResume);
router.post('/upload-avatar', authorize('student'), uploadProfilePic.single('avatar'), uploadAvatar);
router.post('/upload-id-card', authorize('student'), uploadIdCardMiddleware.single('idCard'), uploadIdCard);

module.exports = router;

