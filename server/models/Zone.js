const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a zone name'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please add a zone type'],
    enum: ['Gate', 'Zone', 'Restroom', 'Concession', 'SeatBlock', 'FirstAid', 'ExitGate'],
    default: 'Zone'
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity limit'],
    default: 1000
  },
  currentOccupancy: {
    type: Number,
    required: [true, 'Please add current occupancy level'],
    default: 0
  },
  accessibleFeatures: {
    type: [String],
    default: [] // e.g. ["step-free", "ramp", "elevator", "braille-signage", "hearing-loop"]
  },
  isAccessible: {
    type: Boolean,
    default: true // Whether the zone is generally step-free / wheelchair friendly
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save to update timestamp
ZoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Zone', ZoneSchema);
