const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Warden = require('../models/Warden');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Invalid token or user account is inactive.' });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    // Attach studentId or wardenId if relevant
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) req.user.studentId = student._id;
    } else if (user.role === 'warden') {
      const warden = await Warden.findOne({ userId: user._id });
      if (warden) req.user.wardenId = warden._id;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token authorization.' });
  }
};

module.exports = authenticateToken;
