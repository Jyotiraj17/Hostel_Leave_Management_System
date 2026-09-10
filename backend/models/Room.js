const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true
    },
    hostel: {
      type: String,
      required: [true, 'Hostel name/number is required'],
      trim: true
    },
    block: {
      type: String,
      required: [true, 'Block is required'],
      trim: true
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Full', 'Maintenance'],
      default: 'Available'
    }
  },
  { timestamps: true }
);

// Create compound index for roomNumber + hostel + block uniqueness
roomSchema.index({ roomNumber: 1, hostel: 1, block: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
