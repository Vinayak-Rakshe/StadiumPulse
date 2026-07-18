const { findShortestPath } = require('../services/pathfindingService');
const aiService = require('../services/aiService');
const Zone = require('../models/Zone');
const Sustainability = require('../models/Sustainability');

/**
 * @desc    Chat Wayfinding Navigation Assistant (Translating directions step-by-step)
 * @route   POST /api/ai/nav-chat
 * @access  Public
 */
exports.chatWayfinding = async (req, res, next) => {
  try {
    const { query, startLocation, endLocation, accessibleMode } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a chat query' });
    }

    let pathData = null;

    // If both start and end locations are selected/provided, run Dijkstra's pathfinder
    if (startLocation && endLocation) {
      pathData = findShortestPath(startLocation, endLocation, !!accessibleMode);
    }

    // Call Gemini to generate natural directions based on the graph outputs
    const responseText = await aiService.generateWayfindingDirections(query, pathData);

    res.status(200).json({
      success: true,
      data: {
        responseText,
        pathData // contains raw node list and distance/weights
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get plain-language AI operational bulletin for crowds
 * @route   POST /api/ai/crowd-summary
 * @access  Private (Staff/Organizer)
 */
exports.getCrowdSummary = async (req, res, next) => {
  try {
    const zones = await Zone.find();
    
    const formattedZones = zones.map(z => {
      const density = z.capacity > 0 ? (z.currentOccupancy / z.capacity) * 100 : 0;
      return {
        name: z.name,
        type: z.type,
        capacity: z.capacity,
        currentOccupancy: z.currentOccupancy,
        density
      };
    });

    const summary = await aiService.generateCrowdSummary(formattedZones);

    res.status(200).json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI sustainability recommendations
 * @route   POST /api/ai/sustainability-summary
 * @access  Public
 */
exports.getSustainabilitySummary = async (req, res, next) => {
  try {
    const metrics = await Sustainability.findOne().sort({ timestamp: -1 });
    
    const summary = await aiService.generateSustainabilitySummary(metrics);

    res.status(200).json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};
