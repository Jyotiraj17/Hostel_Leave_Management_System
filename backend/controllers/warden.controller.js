const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Room = require('../models/Room');
const LeaveRequest = require('../models/LeaveRequest');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');

// Recalculate room status helper
const updateRoomStatus = async (roomId) => {
  if (!roomId) return;
  const room = await Room.findById(roomId);
  if (!room) return;

  const currentOccupants = await Student.countDocuments({ roomId: room._id, status: 'active' });
  let newStatus = room.status;

  if (room.status !== 'Maintenance') {
    if (currentOccupants === 0) {
      newStatus = 'Available';
    } else if (currentOccupants < room.capacity) {
      newStatus = 'Partially Occupied';
    } else {
      newStatus = 'Full';
    }
  }

  room.status = newStatus;
  await room.save();
};

// --- WARDEN DASHBOARD ---
exports.getDashboardStats = async (req, res, next) => {
  try {
    const warden = await Warden.findOne({ userId: req.user.userId });
    let hostelFilter = {};
    if (warden && warden.hostel) {
      hostelFilter = { hostel: warden.hostel };
    }

    const totalStudents = await Student.countDocuments({ ...hostelFilter, status: 'active' });
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'Pending' });
    
    // Students currently on approved leave
    const now = new Date();
    const studentsOnLeaveCount = await LeaveRequest.countDocuments({
      status: 'Approved',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const presentStudents = Math.max(0, totalStudents - studentsOnLeaveCount);
    const openComplaints = await Complaint.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });
    const roomsCount = await Room.countDocuments(hostelFilter);

    // Recent activity
    const recentLeaves = await LeaveRequest.find().sort({ createdAt: -1 }).limit(5).populate('studentId');
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5).populate('studentId');
    const recentStudents = await Student.find(hostelFilter).sort({ createdAt: -1 }).limit(5).populate('roomId');
    const recentAnnouncements = await Announcement.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalStudents,
        presentStudents,
        studentsOnLeave: studentsOnLeaveCount,
        pendingLeaves,
        openComplaints,
        roomOccupancy: roomsCount
      },
      recent: {
        leaves: recentLeaves,
        complaints: recentComplaints,
        students: recentStudents,
        announcements: recentAnnouncements
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- STUDENT MANAGEMENT BY WARDEN ---
exports.getStudents = async (req, res, next) => {
  try {
    const { search, department, hostel } = req.query;
    let query = { status: 'active' };

    if (department) query.department = department;
    if (hostel) query.hostel = hostel;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).populate('roomId').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('roomId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

exports.addStudent = async (req, res, next) => {
  try {
    const {
      fullName, rollNo, email, password, phone, department, year,
      gender, hostel, block, roomId, guardianName, guardianPhone, address
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingRoll = await Student.findOne({ rollNo: rollNo.trim() });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'Roll number already registered' });
    }

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Assigned room not found' });
      }
      const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
      if (occupantsCount >= room.capacity) {
        return res.status(400).json({ success: false, message: 'Room has reached maximum capacity.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Student@123', salt);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student'
    });

    const profilePhoto = req.file ? (req.file.path || req.file.secure_url) : '';

    const student = await Student.create({
      userId: user._id,
      fullName,
      rollNo: rollNo.trim(),
      email: email.toLowerCase(),
      phone,
      department,
      year,
      gender,
      hostel: hostel || '',
      block: block || '',
      roomId: roomId || null,
      guardianName: guardianName || '',
      guardianPhone: guardianPhone || '',
      address: address || '',
      profilePhoto
    });

    if (roomId) {
      await updateRoomStatus(roomId);
    }

    res.status(201).json({ success: true, message: 'Student added successfully', student });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const oldRoomId = student.roomId;
    const { fullName, phone, department, year, gender, hostel, block, roomId, guardianName, guardianPhone, address } = req.body;

    if (roomId && roomId.toString() !== (oldRoomId ? oldRoomId.toString() : '')) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Assigned room not found' });
      }
      const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
      if (occupantsCount >= room.capacity) {
        return res.status(400).json({ success: false, message: 'Target room capacity reached.' });
      }
      student.roomId = roomId;
    }

    if (fullName) student.fullName = fullName;
    if (phone) student.phone = phone;
    if (department) student.department = department;
    if (year) student.year = year;
    if (gender) student.gender = gender;
    if (hostel !== undefined) student.hostel = hostel;
    if (block !== undefined) student.block = block;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
    if (address !== undefined) student.address = address;

    if (req.file) {
      student.profilePhoto = req.file.path || req.file.secure_url;
    }

    await student.save();

    if (oldRoomId) await updateRoomStatus(oldRoomId);
    if (student.roomId) await updateRoomStatus(student.roomId);

    res.json({ success: true, message: 'Student updated successfully', student });
  } catch (error) {
    next(error);
  }
};

// --- ROOM VIEW & ASSIGNMENT ---
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    const roomsWithOccupancy = await Promise.all(
      rooms.map(async (room) => {
        const occupants = await Student.find({ roomId: room._id, status: 'active' }).select('fullName rollNo department year profilePhoto');
        return {
          ...room.toObject(),
          currentOccupants: occupants.length,
          availableBeds: Math.max(0, room.capacity - occupants.length),
          occupants
        };
      })
    );
    res.json({ success: true, count: roomsWithOccupancy.length, rooms: roomsWithOccupancy });
  } catch (error) {
    next(error);
  }
};

exports.assignRoom = async (req, res, next) => {
  try {
    const { studentId, roomId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const oldRoomId = student.roomId;

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }
      const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
      if (occupantsCount >= room.capacity && (oldRoomId ? oldRoomId.toString() : '') !== room._id.toString()) {
        return res.status(400).json({ success: false, message: 'Room has reached maximum capacity.' });
      }
      student.roomId = roomId;
    } else {
      student.roomId = null;
    }

    await student.save();

    if (oldRoomId) await updateRoomStatus(oldRoomId);
    if (roomId) await updateRoomStatus(roomId);

    res.json({ success: true, message: 'Student room assignment updated successfully', student });
  } catch (error) {
    next(error);
  }
};

// --- LEAVE MANAGEMENT ---
exports.getLeaveRequests = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await LeaveRequest.find(query)
      .populate('studentId')
      .populate('reviewedBy', 'email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

exports.getLeaveById = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id).populate('studentId');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.json({ success: true, leave });
  } catch (error) {
    next(error);
  }
};

exports.approveLeave = async (req, res, next) => {
  try {
    const { wardenRemarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve leave with status "${leave.status}".` });
    }

    leave.status = 'Approved';
    leave.reviewedBy = req.user.userId;
    leave.reviewedAt = new Date();
    leave.wardenRemarks = wardenRemarks || 'Approved by Warden';
    await leave.save();

    res.json({ success: true, message: 'Leave request approved successfully', leave });
  } catch (error) {
    next(error);
  }
};

exports.rejectLeave = async (req, res, next) => {
  try {
    const { wardenRemarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot reject leave with status "${leave.status}".` });
    }

    leave.status = 'Rejected';
    leave.reviewedBy = req.user.userId;
    leave.reviewedAt = new Date();
    leave.wardenRemarks = wardenRemarks || 'Rejected by Warden';
    await leave.save();

    res.json({ success: true, message: 'Leave request rejected', leave });
  } catch (error) {
    next(error);
  }
};

// --- COMPLAINT MANAGEMENT ---
exports.getComplaints = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query).populate('studentId').sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (remarks) complaint.remarks = remarks;

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    res.json({ success: true, message: 'Complaint status updated', complaint });
  } catch (error) {
    next(error);
  }
};

// --- ANNOUNCEMENTS ---
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().populate('createdBy', 'email role').sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    next(error);
  }
};

exports.addAnnouncement = async (req, res, next) => {
  try {
    const { title, description, priority, expiryDate } = req.body;
    const announcement = await Announcement.create({
      title,
      description,
      priority: priority || 'Normal',
      expiryDate: expiryDate || null,
      createdBy: req.user.userId
    });
    res.status(201).json({ success: true, message: 'Announcement created', announcement });
  } catch (error) {
    next(error);
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement updated', announcement });
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};

// --- PROFILE ---
exports.getProfile = async (req, res, next) => {
  try {
    const warden = await Warden.findOne({ userId: req.user.userId });
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden profile not found' });
    }
    res.json({ success: true, warden });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const warden = await Warden.findOne({ userId: req.user.userId });
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden profile not found' });
    }

    const { fullName, phone, gender, address } = req.body;

    if (fullName) warden.fullName = fullName.trim();
    if (phone !== undefined) warden.phone = phone.trim();
    if (gender && ['Male', 'Female', 'Other'].includes(gender)) warden.gender = gender;
    if (address !== undefined) warden.address = address.trim();

    if (req.file) {
      warden.profilePhoto = req.file.path || req.file.secure_url;
    }

    await warden.save();

    res.json({
      success: true,
      message: 'Warden profile updated successfully',
      warden
    });
  } catch (error) {
    next(error);
  }
};
