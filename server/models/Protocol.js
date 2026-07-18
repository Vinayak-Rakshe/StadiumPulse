const mongoose = require('mongoose');

const ProtocolSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Please add a topic name'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Volunteer', 'Staff', 'All'],
    default: 'All'
  },
  description: {
    type: String,
    required: [true, 'Please add the protocol description']
  },
  keywords: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Protocol', ProtocolSchema);
