const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const wardenController = require('../controllers/warden.controller');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/upload');

// Protect all warden routes
router.use(authenticateToken, authorizeRole('warden', 'admin'));

// Dashboard
router.get('/dashboard', wardenController.getDashboardStats);

// Students
router.get('/students', wardenController.getStudents);
router.get('/students/:id', wardenController.getStudentById);
router.post(
  '/students',
  upload.single('profilePhoto'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('rollNo').notEmpty().withMessage('Roll number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('year').notEmpty().withMessage('Year is required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required')
  ],
  validateRequest,
  wardenController.addStudent
);
router.put('/students/:id', upload.single('profilePhoto'), wardenController.updateStudent);

// Rooms
router.get('/rooms', wardenController.getRooms);
router.post('/rooms/assign', wardenController.assignRoom);

// Leaves
router.get('/leaves', wardenController.getLeaveRequests);
router.get('/leaves/:id', wardenController.getLeaveById);
router.patch('/leaves/:id/approve', wardenController.approveLeave);
router.patch('/leaves/:id/reject', wardenController.rejectLeave);

// Complaints
router.get('/complaints', wardenController.getComplaints);
router.patch('/complaints/:id/status', wardenController.updateComplaintStatus);

// Announcements
router.get('/announcements', wardenController.getAnnouncements);
router.post('/announcements', wardenController.addAnnouncement);
router.put('/announcements/:id', wardenController.updateAnnouncement);
router.delete('/announcements/:id', wardenController.deleteAnnouncement);

// Profile
router.get('/profile', wardenController.getProfile);
router.put('/profile', upload.single('profilePhoto'), wardenController.updateProfile);

module.exports = router;
