const mongoose = require('mongoose');

const SustainabilitySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  waterUsageLitres: {
    type: Number,
    required: [true, 'Please add water usage in litres']
  },
  energyUsageKwh: {
    type: Number,
    required: [true, 'Please add energy usage in kWh']
  },
  wasteGeneratedKg: {
    type: Number,
    required: [true, 'Please add waste generated in kg']
  },
  recyclingRatePercent: {
    type: Number,
    required: [true, 'Please add recycling rate percentage'],
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Sustainability', SustainabilitySchema);
