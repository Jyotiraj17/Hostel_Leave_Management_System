const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/upload');

// Protect all student routes
router.use(authenticateToken, authorizeRole('student'));

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', upload.single('profilePhoto'), studentController.updateProfile);

// Room
router.get('/room', studentController.getRoomInfo);

// Leave Requests
router.post(
  '/leaves',
  [
    body('leaveType').notEmpty().withMessage('Leave type is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
    body('leaveAddress').notEmpty().withMessage('Leave address is required'),
    body('emergencyContact').notEmpty().withMessage('Emergency contact is required')
  ],
  validateRequest,
  studentController.applyLeave
);
router.get('/leaves', studentController.getLeaveHistory);
router.patch('/leaves/:id/cancel', studentController.cancelLeaveRequest);

// Complaints
router.post(
  '/complaints',
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  validateRequest,
  studentController.submitComplaint
);
router.get('/complaints', studentController.getComplaints);

// Announcements
router.get('/announcements', studentController.getAnnouncements);

module.exports = router;
