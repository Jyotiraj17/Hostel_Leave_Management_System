const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/upload');

// Protect all admin routes
router.use(authenticateToken, authorizeRole('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Students
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
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
  adminController.addStudent
);
router.put('/students/:id', upload.single('profilePhoto'), adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Wardens
router.get('/wardens', adminController.getWardens);
router.get('/wardens/:id', adminController.getWardenById);
router.post(
  '/wardens',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  validateRequest,
  adminController.addWarden
);
router.put('/wardens/:id', adminController.updateWarden);
router.delete('/wardens/:id', adminController.deleteWarden);

// Rooms
router.get('/rooms', adminController.getRooms);
router.post(
  '/rooms',
  [
    body('roomNumber').notEmpty().withMessage('Room number is required'),
    body('hostel').notEmpty().withMessage('Hostel is required'),
    body('block').notEmpty().withMessage('Block is required'),
    body('floor').isNumeric().withMessage('Floor must be a number'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
  ],
  validateRequest,
  adminController.addRoom
);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);
router.post('/rooms/assign', adminController.assignRoom);

// Profile Management
router.get('/profile', adminController.getProfile);
router.put('/profile', upload.single('profilePhoto'), adminController.updateProfile);

// Leaves & Complaints & Announcements & Reports
router.get('/leaves', adminController.getAllLeaves);
router.get('/complaints', adminController.getAllComplaints);
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.addAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);
router.get('/reports', adminController.getReports);

module.exports = router;
