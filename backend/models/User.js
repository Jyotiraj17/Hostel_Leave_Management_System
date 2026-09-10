const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['admin', 'warden', 'student'],
      required: [true, 'Role is required']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    fullName: {
      type: String,
      default: 'System Administrator',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
