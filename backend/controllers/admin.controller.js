const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Room = require('../models/Room');
const LeaveRequest = require('../models/LeaveRequest');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');

// Utility to recalculate and update room status
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

// --- ADMIN DASHBOARD ---
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalWardens = await Warden.countDocuments({ status: 'active' });
    const totalRooms = await Room.countDocuments();
    
    // Count occupied and available rooms
    const fullRooms = await Room.countDocuments({ status: 'Full' });
    const partiallyOccupiedRooms = await Room.countDocuments({ status: 'Partially Occupied' });
    const availableRooms = await Room.countDocuments({ status: 'Available' });

    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'Pending' });
    const activeComplaints = await Complaint.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });

    // Recent activity
    const recentStudents = await Student.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5).populate('roomId');
    const recentLeaves = await LeaveRequest.find().sort({ createdAt: -1 }).limit(5).populate('studentId');
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5).populate('studentId');
    const recentAnnouncements = await Announcement.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalWardens,
        totalRooms,
        occupiedRooms: fullRooms + partiallyOccupiedRooms,
        availableRooms,
        pendingLeaves,
        activeComplaints
      },
      recent: {
        students: recentStudents,
        leaves: recentLeaves,
        complaints: recentComplaints,
        announcements: recentAnnouncements
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- STUDENT MANAGEMENT ---
exports.getStudents = async (req, res, next) => {
  try {
    const { search, department, hostel, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    if (hostel) {
      query.hostel = hostel;
    }

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
    const student = await Student.findById(req.params.id).populate('roomId').populate('userId', '-password');
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

    // Check unique email and rollNo
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const existingRoll = await Student.findOne({ rollNo: rollNo.trim() });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'Student with this roll number already exists' });
    }

    // Room capacity check if roomId provided
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Assigned room not found' });
      }
      const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
      if (occupantsCount >= room.capacity) {
        return res.status(400).json({ success: false, message: `Room ${room.roomNumber} has reached maximum capacity (${room.capacity}).` });
      }
    }

    // Create user credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Student@123', salt);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student'
    });

    // Photo URL from Cloudinary/Multer if uploaded
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

    res.status(201).json({ success: true, message: 'Student created successfully', student });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const oldRoomId = student.roomId;
    const {
      fullName, rollNo, phone, department, year, gender, hostel, block,
      roomId, guardianName, guardianPhone, address, status
    } = req.body;

    // Roll number uniqueness check if changed
    if (rollNo && rollNo.trim() !== student.rollNo) {
      const existingRoll = await Student.findOne({ rollNo: rollNo.trim(), _id: { $ne: studentId } });
      if (existingRoll) {
        return res.status(400).json({ success: false, message: 'Roll number is already in use by another student' });
      }
      student.rollNo = rollNo.trim();
    }

    // Room capacity check if changing room
    if (roomId && roomId.toString() !== (oldRoomId ? oldRoomId.toString() : '')) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Assigned room not found' });
      }
      const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
      if (occupantsCount >= room.capacity) {
        return res.status(400).json({ success: false, message: `Room ${room.roomNumber} has reached maximum capacity.` });
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
    if (status) {
      student.status = status;
      await User.findByIdAndUpdate(student.userId, { status });
    }

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

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const roomId = student.roomId;
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(student._id);

    if (roomId) {
      await updateRoomStatus(roomId);
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- WARDEN MANAGEMENT ---
exports.getWardens = async (req, res, next) => {
  try {
    const wardens = await Warden.find().sort({ createdAt: -1 });
    res.json({ success: true, count: wardens.length, wardens });
  } catch (error) {
    next(error);
  }
};

exports.getWardenById = async (req, res, next) => {
  try {
    const warden = await Warden.findById(req.params.id).populate('userId', '-password');
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }
    res.json({ success: true, warden });
  } catch (error) {
    next(error);
  }
};

exports.addWarden = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, hostel, block } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Warden@123', salt);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'warden'
    });

    const warden = await Warden.create({
      userId: user._id,
      fullName,
      email: email.toLowerCase(),
      phone,
      hostel: hostel || '',
      block: block || ''
    });

    res.status(201).json({ success: true, message: 'Warden created successfully', warden });
  } catch (error) {
    next(error);
  }
};

exports.updateWarden = async (req, res, next) => {
  try {
    const warden = await Warden.findById(req.params.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    const { fullName, phone, hostel, block, status } = req.body;
    if (fullName) warden.fullName = fullName;
    if (phone) warden.phone = phone;
    if (hostel !== undefined) warden.hostel = hostel;
    if (block !== undefined) warden.block = block;
    if (status) {
      warden.status = status;
      await User.findByIdAndUpdate(warden.userId, { status });
    }

    await warden.save();
    res.json({ success: true, message: 'Warden updated successfully', warden });
  } catch (error) {
    next(error);
  }
};

exports.deleteWarden = async (req, res, next) => {
  try {
    const warden = await Warden.findById(req.params.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    await User.findByIdAndDelete(warden.userId);
    await Warden.findByIdAndDelete(warden._id);

    res.json({ success: true, message: 'Warden deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- ROOM MANAGEMENT ---
exports.getRooms = async (req, res, next) => {
  try {
    const { hostel, block, floor, status } = req.query;
    let query = {};

    if (hostel) query.hostel = hostel;
    if (block) query.block = block;
    if (floor) query.floor = Number(floor);
    if (status) query.status = status;

    const rooms = await Room.find(query).sort({ roomNumber: 1 });

    // Calculate current occupants for each room dynamically
    const roomsWithOccupancy = await Promise.all(
      rooms.map(async (room) => {
        const occupants = await Student.find({ roomId: room._id, status: 'active' }).select('fullName rollNo department year profilePhoto');
        const availableBeds = Math.max(0, room.capacity - occupants.length);
        return {
          ...room.toObject(),
          currentOccupants: occupants.length,
          availableBeds,
          occupants
        };
      })
    );

    res.json({ success: true, count: roomsWithOccupancy.length, rooms: roomsWithOccupancy });
  } catch (error) {
    next(error);
  }
};

exports.addRoom = async (req, res, next) => {
  try {
    const { roomNumber, hostel, block, floor, capacity } = req.body;

    const existingRoom = await Room.findOne({ roomNumber: roomNumber.trim(), hostel, block });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room already exists in this hostel/block' });
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      hostel,
      block,
      floor,
      capacity,
      status: 'Available'
    });

    res.status(201).json({ success: true, message: 'Room created successfully', room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const { capacity, status, floor } = req.body;

    if (capacity !== undefined) {
      const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
      if (capacity < occupantsCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot decrease capacity below current occupant count (${occupantsCount}).`
        });
      }
      room.capacity = capacity;
    }

    if (floor !== undefined) room.floor = floor;
    if (status) room.status = status;

    await room.save();
    await updateRoomStatus(room._id);

    res.json({ success: true, message: 'Room updated successfully', room });
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
        return res.status(400).json({ success: false, message: `Room ${room.roomNumber} has reached maximum capacity.` });
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

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const occupantsCount = await Student.countDocuments({ roomId: room._id, status: 'active' });
    if (occupantsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active occupants. Reassign students first.'
      });
    }

    await Room.findByIdAndDelete(room._id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- LEAVES & COMPLAINTS ---
exports.getAllLeaves = async (req, res, next) => {
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

exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('studentId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
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

// --- REPORTS ---
exports.getReports = async (req, res, next) => {
  try {
    const { reportType } = req.query;

    if (reportType === 'students') {
      const data = await Student.find({ status: 'active' }).populate('roomId');
      return res.json({ success: true, reportType, count: data.length, data });
    }
    if (reportType === 'wardens') {
      const data = await Warden.find({ status: 'active' });
      return res.json({ success: true, reportType, count: data.length, data });
    }
    if (reportType === 'rooms') {
      const rooms = await Room.find();
      const data = await Promise.all(
        rooms.map(async (r) => {
          const occupantsCount = await Student.countDocuments({ roomId: r._id, status: 'active' });
          return { ...r.toObject(), currentOccupants: occupantsCount };
        })
      );
      return res.json({ success: true, reportType, count: data.length, data });
    }
    if (reportType === 'leaves') {
      const data = await LeaveRequest.find().populate('studentId');
      return res.json({ success: true, reportType, count: data.length, data });
    }
    if (reportType === 'complaints') {
      const data = await Complaint.find().populate('studentId');
      return res.json({ success: true, reportType, count: data.length, data });
    }

    res.status(400).json({ success: false, message: 'Invalid reportType specified' });
  } catch (error) {
    next(error);
  }
};

// --- PROFILE MANAGEMENT ---
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }
    res.json({ success: true, admin: user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const { fullName, phone, gender, address } = req.body;

    if (fullName) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (gender && ['Male', 'Female', 'Other'].includes(gender)) user.gender = gender;
    if (address !== undefined) user.address = address.trim();

    if (req.file) {
      user.profilePhoto = req.file.path || req.file.secure_url;
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      admin: userObj
    });
  } catch (error) {
    next(error);
  }
};
