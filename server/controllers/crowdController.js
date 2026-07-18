const Zone = require('../models/Zone');
const Sustainability = require('../models/Sustainability');
const Match = require('../models/Match');

/**
 * @desc    Get all zone details with calculated densities
 * @route   GET /api/crowd/zones
 * @access  Public
 */
exports.getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find();
    
    // Calculate live density percentage
    const formattedZones = zones.map(z => {
      const density = z.capacity > 0 ? (z.currentOccupancy / z.capacity) * 100 : 0;
      return {
        _id: z._id,
        name: z.name,
        type: z.type,
        capacity: z.capacity,
        currentOccupancy: z.currentOccupancy,
        isAccessible: z.isAccessible,
        accessibleFeatures: z.accessibleFeatures,
        density,
        updatedAt: z.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: formattedZones.length,
      data: formattedZones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update specific zone current occupancy (Simulates live feeds)
 * @route   PUT /api/crowd/zones/:id
 * @access  Private (Staff/Organizer)
 */
exports.updateZoneOccupancy = async (req, res, next) => {
  try {
    const { currentOccupancy } = req.body;
    
    if (currentOccupancy === undefined || currentOccupancy < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid non-negative occupancy count' });
    }

    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    // Cap occupancy to capacity plus a small overfill margin for realistic congestion
    zone.currentOccupancy = Math.min(currentOccupancy, zone.capacity * 1.2);
    await zone.save();

    const density = (zone.currentOccupancy / zone.capacity) * 100;

    res.status(200).json({
      success: true,
      data: {
        id: zone._id,
        name: zone.name,
        capacity: zone.capacity,
        currentOccupancy: zone.currentOccupancy,
        density
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get latest sustainability metrics log
 * @route   GET /api/crowd/sustainability
 * @access  Public
 */
exports.getSustainabilityMetrics = async (req, res, next) => {
  try {
    const metrics = await Sustainability.findOne().sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tournament matches
 * @route   GET /api/crowd/matches
 * @access  Public
 */
exports.getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};
