const Student = require('../models/Student');
const Room = require('../models/Room');
const LeaveRequest = require('../models/LeaveRequest');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');

// --- DASHBOARD ---
exports.getDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate('roomId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const currentLeave = await LeaveRequest.findOne({
      studentId: student._id,
      status: 'Approved',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    const pendingLeavesCount = await LeaveRequest.countDocuments({
      studentId: student._id,
      status: 'Pending'
    });

    const activeComplaintsCount = await Complaint.countDocuments({
      studentId: student._id,
      status: { $in: ['Pending', 'In Progress'] }
    });

    const announcements = await Announcement.find({
      status: 'Active',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      dashboard: {
        student: {
          fullName: student.fullName,
          rollNo: student.rollNo,
          hostel: student.hostel,
          block: student.block,
          roomNumber: student.roomId ? student.roomId.roomNumber : 'Not Assigned',
          profilePhoto: student.profilePhoto
        },
        currentLeaveStatus: currentLeave ? 'On Approved Leave' : 'Present in Hostel',
        pendingLeavesCount,
        activeComplaintsCount,
        recentAnnouncements: announcements
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- PROFILE ---
exports.getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate('roomId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { phone, gender, address, guardianName, guardianPhone } = req.body;

    if (phone) student.phone = phone;
    if (gender && ['Male', 'Female', 'Other'].includes(gender)) student.gender = gender;
    if (address !== undefined) student.address = address;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;

    if (req.file) {
      student.profilePhoto = req.file.path || req.file.secure_url;
    }

    await student.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    next(error);
  }
};

// --- MY ROOM ---
exports.getRoomInfo = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student || !student.roomId) {
      return res.json({
        success: true,
        assigned: false,
        message: 'No room currently assigned'
      });
    }

    const room = await Room.findById(student.roomId);
    if (!room) {
      return res.json({ success: true, assigned: false, message: 'Room record not found' });
    }

    const roommates = await Student.find({
      roomId: room._id,
      status: 'active',
      _id: { $ne: student._id }
    }).select('fullName rollNo department year profilePhoto');

    res.json({
      success: true,
      assigned: true,
      room: {
        roomNumber: room.roomNumber,
        hostel: room.hostel,
        block: room.block,
        floor: room.floor,
        capacity: room.capacity,
        status: room.status,
        roommates
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- LEAVE MANAGEMENT ---
exports.applyLeave = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const {
      leaveType, startDate, endDate, reason,
      destination, leaveAddress, emergencyContact, remarks
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.'
      });
    }

    const leaveRequest = await LeaveRequest.create({
      studentId: student._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      destination,
      leaveAddress,
      emergencyContact,
      remarks: remarks || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: leaveRequest
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaveHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const leaves = await LeaveRequest.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

exports.cancelLeaveRequest = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const leave = await LeaveRequest.findOne({ _id: req.params.id, studentId: student._id });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending leave requests can be cancelled. Current status is "${leave.status}".`
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({ success: true, message: 'Leave request cancelled successfully', leave });
  } catch (error) {
    next(error);
  }
};

// --- COMPLAINTS ---
exports.submitComplaint = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { category, subject, description } = req.body;

    const complaint = await Complaint.create({
      studentId: student._id,
      category,
      subject,
      description,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

// --- ANNOUNCEMENTS ---
exports.getAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      status: 'Active',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    next(error);
  }
};
