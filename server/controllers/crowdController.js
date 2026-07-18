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
 * Compute the real-time status for a match by combining its stored date and
 * time fields into a full Date object and comparing against the current time.
 *
 * Rules:
 *   - kickoffAt > now                          → "Upcoming"
 *   - kickoffAt <= now < kickoffAt + 3 hours   → "Live"
 *   - kickoffAt + 3 hours <= now               → "Completed"
 *
 * @param {Date}   matchDate  - The match's date field (midnight UTC from DB)
 * @param {string} matchTime  - The kickoff time string, e.g. "20:00"
 * @param {Date}   [now]      - The reference time to compare against (defaults to new Date())
 * @returns {"Upcoming"|"Live"|"Completed"}
 */
function computeMatchStatus(matchDate, matchTime, now = new Date()) {
  // Merge the date and time string into one precise Date object.
  // matchDate comes from MongoDB as a UTC midnight Date; we replace its
  // hours/minutes using the stored time string (treated as UTC).
  const [hours, minutes] = (matchTime || '00:00').split(':').map(Number);
  const kickoffAt = new Date(matchDate);
  kickoffAt.setUTCHours(hours, minutes, 0, 0);

  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

  if (now < kickoffAt) {
    return 'Upcoming';
  } else if (now < new Date(kickoffAt.getTime() + THREE_HOURS_MS)) {
    return 'Live';
  } else {
    return 'Completed';
  }
}

/**
 * @desc    Get all tournament matches
 * @route   GET /api/crowd/matches
 * @access  Public
 */
exports.getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ date: 1 });

    // Override stored status with a value computed from the current server time
    // so the schedule always reflects reality regardless of what was seeded.
    const data = matches.map((m) => {
      const obj = m.toObject();
      obj.status = computeMatchStatus(m.date, m.time);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Export the helper so it can be unit-tested independently.
exports.computeMatchStatus = computeMatchStatus;
exports._computeMatchStatus = computeMatchStatus;

