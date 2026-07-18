const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  teams: {
    type: String,
    required: [true, 'Please add teams, e.g. USA vs England'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a match date']
  },
  time: {
    type: String,
    required: [true, 'Please add a kickoff time']
  },
  stadiumName: {
    type: String,
    default: 'StadiumPulse Arena (New York/New Jersey)'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Live', 'Completed'],
    default: 'Upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);
